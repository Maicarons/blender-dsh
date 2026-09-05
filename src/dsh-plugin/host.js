// Blender DSH Plugin - Host Side
// Provides AI-controllable Blender 3D modeling tools via DSH dynamic plugins
// Licensed under AGPL-3.0

return {
  inject: ['subprocess', 'timer'],
  apply(ctx) {
    // === Configuration ===
    const BLENDER_PATH = '/usr/bin/blender';
    const OUTPUT_DIR = '/home/user/blender-dsh/output';
    const MAX_TIMEOUT = 600000; // 10 minutes max

    // === Core execution engine ===

    // Encode string to base64
    function encodeBase64(str) {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }

    // Escape a JSON string for embedding in a Python single-quoted triple-quoted string
    function escapePythonJson(str) {
      return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    // Execute a Python script in Blender headless mode via --python-expr (base64 encoded)
    async function blenderExec(script, timeoutMs = 120000) {
      const subprocess = ctx.get('subprocess');
      if (subprocess === undefined) {
        return { success: false, error: 'subprocess service not available', result: {} };
      }

      // Wrap the script with JSON result output
      const wrapped = `import json, sys, traceback
try:
${script.split('\n').map(l => '  ' + l).join('\n')}
  print(json.dumps({"status":"ok"}))
except Exception as e:
  print(json.dumps({"status":"error","error":str(e),"traceback":traceback.format_exc()}))
  sys.exit(1)`;

      // Base64 encode the wrapped script
      const encoded = encodeBase64(wrapped);
      const bootstrap = "exec(__import__('base64').b64decode('" + encoded + "').decode())";

      // Spawn Blender process
      console.log('[Blender] Executing script (' + wrapped.length + ' bytes)');
      const handle = subprocess.spawn({
        argv: [BLENDER_PATH, '--background', '--python-expr', bootstrap],
        cwd: OUTPUT_DIR,
        stdio: {
          stdin: 'ignore',
          stdout: { maxBytes: 2 * 1024 * 1024 },
          stderr: { maxBytes: 2 * 1024 * 1024 },
        },
        graceMs: 10000,
      });

      // Wait for completion with timeout
      const timeoutPromise = ctx.timeout(timeoutMs).then(function () {
        handle.terminate();
        return { exitCode: -1, signal: 'SIGTERM', timedOut: true };
      });

      const outcome = await Promise.race([handle.done, timeoutPromise]);

      // Read output
      const stdout = (handle.collected.stdout && handle.collected.stdout.readFrom(0)) ? handle.collected.stdout.readFrom(0).text : '';
      const stderr = (handle.collected.stderr && handle.collected.stderr.readFrom(0)) ? handle.collected.stderr.readFrom(0).text : '';

      // Parse JSON result from last line of stdout
      var result = { parsed: false };
      var lines = stdout.trim().split('\n');
      for (var i = lines.length - 1; i >= 0; i--) {
        try {
          var parsed = JSON.parse(lines[i]);
          if (parsed && typeof parsed === 'object') {
            result = parsed;
            break;
          }
        } catch (_) {}
      }

      return {
        success: outcome.exitCode === 0,
        exitCode: outcome.exitCode,
        result: result,
        stdout: stdout,
        stderr: stderr,
        timedOut: outcome.exitCode === -1,
      };
    }

    // Helper: generate a Python script with embedded JSON parameters
    function makeScript(operationCode, params) {
      var paramsStr = escapePythonJson(JSON.stringify(params || {}));
      return [
        'import json, math, sys, traceback',
        'params = json.loads("""' + paramsStr + '""")',
        '',
        operationCode,
      ].join('\n');
    }

    // === Helper Python code templates ===

    // Helper: Create object with name, location, rotation, scale
    var PY_SETUP_OBJ = `
obj = bpy.context.active_object
if obj:
  name = params.get('name', '')
  if name:
    obj.name = name
  loc = params.get('location', [0, 0, 0])
  rot = params.get('rotation', [0, 0, 0])
  scl = params.get('scale', [1, 1, 1])
  obj.location = (loc[0], loc[1], loc[2])
  obj.rotation_euler = (rot[0], rot[1], rot[2])
  obj.scale = (scl[0], scl[1], scl[2])
`.trim();

    // ================================================================
    // Tool 1: blender_execute - Execute arbitrary Python code
    // ================================================================
    harness.registerTool(ctx, harness.defineTool({
      name: 'blender_execute',
      description: 'Execute arbitrary Python code in Blender headless mode. Run any Blender Python API (bpy, bmesh, mathutils) commands for creating, modifying, or rendering 3D models.',
      parameters: {
        type: 'object',
        properties: {
          script: {
            type: 'string',
            description: 'Python code to execute in Blender. Can use bpy, bmesh, mathutils, bpy_extras, etc. All print() output is captured.',
          },
          description: {
            type: 'string',
            description: 'Brief description of what the script does (for logging).',
          },
          timeout: {
            type: 'number',
            description: 'Execution timeout in milliseconds (default: 120000, max: 600000).',
          },
        },
        required: ['script'],
      },
      output: {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            result: { type: 'object' },
            stdout: { type: 'string' },
            stderr: { type: 'string' },
          },
        },
        render: function (_a, v) {
          return [{ type: 'text', text: v.success ? '✅ Blender executed successfully' : '❌ Blender execution failed' }];
        },
      },
      execute: async function (args) {
        return await blenderExec(args.script, Math.min(args.timeout || 120000, MAX_TIMEOUT));
      },
    }));

    // ================================================================
    // Tool 2: blender_create - Create 3D objects
    // ================================================================
    harness.registerTool(ctx, harness.defineTool({
      name: 'blender_create',
      description: 'Create 3D objects in Blender. Supports primitives (cube, sphere, cylinder, cone, torus, monkey, etc.), custom meshes from vertices/faces, text objects, and curves.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'Type of object to create.',
            enum: ['cube', 'sphere', 'cylinder', 'cone', 'torus', 'ico_sphere', 'uv_sphere', 'monkey', 'plane', 'circle', 'grid', 'text', 'custom_mesh', 'bezier_curve'],
          },
          name: { type: 'string', description: 'Name for the created object.' },
          location: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'Location [x, y, z]. Default: [0,0,0].' },
          rotation: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'Rotation in radians [x, y, z].' },
          scale: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'Scale [x, y, z].' },
          size: { type: 'number', description: 'Size parameter. For cube: edge length. For sphere/cylinder/cone: radius. Default: 2.' },
          radius: { type: 'number', description: 'Radius (for torus: major radius).' },
          minor_radius: { type: 'number', description: 'Minor radius for torus.' },
          depth: { type: 'number', description: 'Depth/height for cylinder, cone, text extrusion.' },
          vertices: { type: 'array', items: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3 }, description: 'Custom mesh: [[x,y,z],...] vertex positions.' },
          faces: { type: 'array', items: { type: 'array', items: { type: 'integer' } }, description: 'Custom mesh: [[i0,i1,i2,...],...] face indices.' },
          text_content: { type: 'string', description: 'Text content for text type.' },
          subdivisions: { type: 'integer', description: 'Subdivision level for ico_sphere. Default: 2.' },
          grid_columns: { type: 'integer', description: 'Grid columns. Default: 10.' },
          grid_rows: { type: 'integer', description: 'Grid rows. Default: 10.' },
        },
        required: ['type'],
      },
      output: {
        schema: { type: 'object' },
        render: function (_a, v) {
          if (!v.success) return [{ type: 'text', text: '❌ ' + (v.result && v.result.error || 'Failed') }];
          return [{ type: 'text', text: '✅ Created: ' + (v.result && v.result.object || 'object') }];
        },
      },
      execute: async function (args) {
        var op = '';
        var type = args.type;

        if (type === 'cube') {
          op = 'bpy.ops.mesh.primitive_cube_add(size=params.get("size", 2))';
        } else if (type === 'sphere' || type === 'uv_sphere') {
          op = 'bpy.ops.mesh.primitive_uv_sphere_add(radius=params.get("radius", params.get("size", 1)))';
        } else if (type === 'cylinder') {
          op = 'bpy.ops.mesh.primitive_cylinder_add(radius=params.get("radius", params.get("size", 1)), depth=params.get("depth", 2))';
        } else if (type === 'cone') {
          op = 'bpy.ops.mesh.primitive_cone_add(radius=params.get("radius", params.get("size", 1)), depth=params.get("depth", 2))';
        } else if (type === 'torus') {
          op = 'bpy.ops.mesh.primitive_torus_add(major_radius=params.get("radius", 2), minor_radius=params.get("minor_radius", 0.5))';
        } else if (type === 'ico_sphere') {
          op = 'bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=params.get("subdivisions", 2), radius=params.get("radius", params.get("size", 1)))';
        } else if (type === 'monkey') {
          op = 'bpy.ops.mesh.primitive_monkey_add(size=params.get("size", 2))';
        } else if (type === 'plane') {
          op = 'bpy.ops.mesh.primitive_plane_add(size=params.get("size", 2))';
        } else if (type === 'circle') {
          op = 'bpy.ops.mesh.primitive_circle_add(radius=params.get("radius", params.get("size", 1)), vertices=params.get("vertices_count", 32))';
        } else if (type === 'grid') {
          op = 'bpy.ops.mesh.primitive_grid_add(x_subdivisions=params.get("grid_columns", 10), y_subdivisions=params.get("grid_rows", 10), size=params.get("size", 2))';
        } else if (type === 'text') {
          op = 'bpy.ops.object.text_add()\n  obj = bpy.context.active_object\n  obj.data.body = params.get("text_content", "Hello")';
        } else if (type === 'bezier_curve') {
          op = 'bpy.ops.curve.primitive_bezier_curve_add()';
        } else if (type === 'custom_mesh') {
          var vertsJson = args.vertices || [];
          var facesJson = args.faces || [];
          var vertsStr = JSON.stringify(vertsJson);
          var facesStr = JSON.stringify(facesJson);
          op = 'verts = ' + vertsStr + '\n  faces = ' + facesStr + '\n  mesh = bpy.data.meshes.new(params.get("name", "CustomMesh"))\n  mesh.from_pydata(verts, [], faces)\n  mesh.update()\n  obj = bpy.data.objects.new(params.get("name", "CustomMesh"), mesh)\n  bpy.context.collection.objects.link(obj)';
        }

        var code = 'import bpy\n' + op + '\n' + PY_SETUP_OBJ + '\nname = params.get("name", obj.name if obj else "Object")\nprint(json.dumps({"status":"ok","object":obj.name if obj else name,"type":"' + type + '"}))';

        var fullScript = makeScript(code, args);
        return await blenderExec(fullScript);
      },
    }));

    // ================================================================
    // Tool 3: blender_modify - Modify objects (transform, modifiers, materials)
    // ================================================================
    harness.registerTool(ctx, harness.defineTool({
      name: 'blender_modify',
      description: 'Modify 3D objects in Blender. Supports transforming, applying modifiers, creating/assigning materials, and boolean operations.',
      parameters: {
        type: 'object',
        properties: {
          object: { type: 'string', description: 'Target object name. If omitted, operates on the active/selected object.' },
          operation: {
            type: 'string',
            description: 'Operation to perform.',
            enum: ['transform', 'modifier', 'material', 'boolean', 'shade_smooth', 'shade_flat', 'join', 'rename', 'delete', 'duplicate', 'origin_set'],
          },
          // Transform
          location: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'New location [x, y, z].' },
          rotation: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'New rotation in radians [x, y, z].' },
          scale: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'New scale [x, y, z].' },
          // Modifier
          modifier_type: {
            type: 'string',
            description: 'Modifier type to add.',
            enum: ['SUBSURF', 'MIRROR', 'ARRAY', 'BEVEL', 'SOLIDIFY', 'SCREW', 'WARP', 'DISPLACE', 'SIMPLE_DEFORM', 'BOOLEAN', 'DECIMATE', 'REMESH', 'TRIANGULATE', 'WELD', 'WIREFRAME', 'SKIN', 'SMOOTH', 'LATTICE', 'CAST', 'CURVE', 'HOOK', 'LAPLACIANSMOOTH', 'MASK', 'OCEAN', 'SHRINKWRAP'],
          },
          modifier_name: { type: 'string', description: 'Name for the new modifier.' },
          modifier_settings: { type: 'object', description: 'Modifier-specific settings as key-value pairs.' },
          apply_modifier: { type: 'boolean', description: 'Apply the modifier permanently after adding.' },
          // Material
          color: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 4, description: 'Base color [r, g, b] or [r, g, b, a] (0-1).' },
          metallic: { type: 'number', description: 'Metallic value 0-1.' },
          roughness: { type: 'number', description: 'Roughness value 0-1.' },
          material_name: { type: 'string', description: 'Material name.' },
          emission_color: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'Emission color [r, g, b] (0-1).' },
          emission_strength: { type: 'number', description: 'Emission strength.' },
          // Boolean
          tool_object: { type: 'string', description: 'Tool object name for boolean operation.' },
          boolean_operation: { type: 'string', enum: ['UNION', 'DIFFERENCE', 'INTERSECT'], description: 'Boolean operation type.' },
          // Duplicate
          duplicate_count: { type: 'integer', description: 'Number of duplicates (for array via modifier).' },
          offset: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'Offset for array/duplicate [x, y, z].' },
        },
        required: ['operation'],
      },
      output: {
        schema: { type: 'object' },
        render: function (_a, v) {
          if (!v.success) return [{ type: 'text', text: '❌ ' + (v.result && v.result.error || 'Failed') }];
          return [{ type: 'text', text: '✅ Modified: ' + (v.result && v.result.message || 'ok') }];
        },
      },
      execute: async function (args) {
        var code = 'import bpy\n';
        var targetCode = '';
        var resultMsg = 'ok';

        // Select the target object
        if (args.object) {
          targetCode += 'obj = bpy.data.objects.get(params.get("object", ""))\n';
          targetCode += 'if obj is None:\n  raise ValueError("Object not found: " + params.get("object", ""))\n';
          targetCode += 'bpy.context.view_layer.objects.active = obj\n';
          targetCode += 'obj.select_set(True)\n';
        } else {
          targetCode += 'obj = bpy.context.active_object\n';
          targetCode += 'if obj is None:\n  raise ValueError("No active object")\n';
        }

        code += targetCode;

        switch (args.operation) {
          case 'transform':
            code += 'loc = params.get("location")\n';
            code += 'rot = params.get("rotation")\n';
            code += 'scl = params.get("scale")\n';
            code += 'if loc: obj.location = (loc[0], loc[1], loc[2])\n';
            code += 'if rot: obj.rotation_euler = (rot[0], rot[1], rot[2])\n';
            code += 'if scl: obj.scale = (scl[0], scl[1], scl[2])\n';
            resultMsg = 'transformed';
            break;

          case 'modifier': {
            var modType = args.modifier_type || 'SUBSURF';
            code += 'mod = obj.modifiers.new(name=params.get("modifier_name", "' + modType + '"), type="' + modType + '")\n';
            code += 'settings = params.get("modifier_settings", {})\n';
            code += 'for key, val in settings.items():\n  try:\n    setattr(mod, key, val)\n  except:\n    pass\n';
            if (args.apply_modifier) {
              code += 'bpy.ops.object.modifier_apply(modifier=mod.name)\n';
            }
            resultMsg = 'modifier ' + modType + ' applied';
            break;
          }

          case 'material':
            code += 'mat = bpy.data.materials.new(params.get("material_name", obj.name + "_mat"))\n';
            code += 'mat.use_nodes = True\n';
            code += 'bsdf = mat.node_tree.nodes.get("Principled BSDF")\n';
            code += 'if bsdf:\n';
            code += '  col = params.get("color", [0.8, 0.8, 0.8])\n';
            code += '  if len(col) == 3: col = col + [1.0]\n';
            code += '  bsdf.inputs["Base Color"].default_value = col\n';
            code += '  if "metallic" in params: bsdf.inputs["Metallic"].default_value = params["metallic"]\n';
            code += '  if "roughness" in params: bsdf.inputs["Roughness"].default_value = params["roughness"]\n';
            code += '  if "emission_color" in params or "emission_strength" in params:\n';
            code += '    em_col = params.get("emission_color", [0, 0, 0])\n';
            code += '    em_str = params.get("emission_strength", 1.0)\n';
            code += '    bsdf.inputs["Emission Color"].default_value = em_col + [1.0]\n';
            code += '    bsdf.inputs["Emission Strength"].default_value = em_str\n';
            code += 'if obj.data.materials:\n  obj.data.materials[0] = mat\n';
            code += 'else:\n  obj.data.materials.append(mat)\n';
            resultMsg = 'material assigned';
            break;

          case 'boolean':
            code += 'tool_obj = bpy.data.objects.get(params.get("tool_object", ""))\n';
            code += 'if tool_obj is None: raise ValueError("Tool object not found")\n';
            code += 'bool_mod = obj.modifiers.new(name="Boolean", type="BOOLEAN")\n';
            code += 'bool_mod.operation = params.get("boolean_operation", "DIFFERENCE")\n';
            code += 'bool_mod.object = tool_obj\n';
            if (args.apply_modifier !== false) {
              code += 'bpy.ops.object.modifier_apply(modifier=bool_mod.name)\n';
            }
            resultMsg = 'boolean operation applied';
            break;

          case 'shade_smooth':
            code += 'bpy.ops.object.shade_smooth()\n';
            resultMsg = 'shade smooth';
            break;

          case 'shade_flat':
            code += 'bpy.ops.object.shade_flat()\n';
            resultMsg = 'shade flat';
            break;

          case 'delete':
            code += 'bpy.ops.object.delete()\n';
            resultMsg = 'deleted';
            break;

          case 'duplicate': {
            var count = args.duplicate_count || 1;
            var offset = args.offset || [2, 0, 0];
            code += 'count = ' + count + '\n';
            code += 'offset = ' + JSON.stringify(offset) + '\n';
            code += 'for i in range(1, count):\n';
            code += '  new_obj = obj.copy()\n';
            code += '  new_obj.data = obj.data.copy()\n';
            code += '  bpy.context.collection.objects.link(new_obj)\n';
            code += '  new_obj.location = (obj.location[0] + offset[0] * i, obj.location[1] + offset[1] * i, obj.location[2] + offset[2] * i)\n';
            resultMsg = 'duplicated ' + count + ' times';
            break;
          }

          case 'origin_set':
            code += 'bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY")\n';
            resultMsg = 'origin set to geometry center';
            break;

          case 'join':
            code += 'bpy.ops.object.join()\n';
            resultMsg = 'objects joined';
            break;

          case 'rename':
            code += 'obj.name = params.get("object", obj.name) + "_renamed"\n';
            resultMsg = 'renamed';
            break;
        }

        code += '\nprint(json.dumps({"status":"ok","message":"' + resultMsg + '","object":obj.name}))';

        var fullScript = makeScript(code, args);
        return await blenderExec(fullScript);
      },
    }));

    // ================================================================
    // Tool 4: blender_scene - Scene management, lighting, rendering
    // ================================================================
    harness.registerTool(ctx, harness.defineTool({
      name: 'blender_scene',
      description: 'Manage Blender scenes: clear scene, add lights, add cameras, configure render settings, and render to image.',
      parameters: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            description: 'Scene operation to perform.',
            enum: ['clear', 'light_add', 'camera_add', 'ground_add', 'render', 'render_settings', 'world_set', 'export'],
          },
          // Light
          light_type: { type: 'string', enum: ['POINT', 'SUN', 'SPOT', 'AREA'], description: 'Light type.' },
          light_energy: { type: 'number', description: 'Light energy/power.' },
          light_color: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'Light color [r, g, b] (0-1).' },
          light_size: { type: 'number', description: 'Light size (for AREA lights).' },
          // Camera
          camera_location: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'Camera location [x, y, z].' },
          camera_target: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'Camera look-at target [x, y, z].' },
          camera_lens: { type: 'number', description: 'Camera focal length in mm.' },
          // Render
          output_path: { type: 'string', description: 'Output file path for rendering.' },
          resolution_x: { type: 'integer', description: 'Render width in pixels.' },
          resolution_y: { type: 'integer', description: 'Render height in pixels.' },
          engine: { type: 'string', enum: ['CYCLES', 'EEVEE'], description: 'Render engine.' },
          samples: { type: 'integer', description: 'Render samples (Cycles) or TAA samples (EEVEE).' },
          transparent: { type: 'boolean', description: 'Transparent background for rendering.' },
          // World
          world_color: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'World background color [r, g, b] (0-1).' },
          // Export
          export_format: { type: 'string', enum: ['OBJ', 'FBX', 'GLB', 'STL', 'PLY', 'X3D', 'ABC'], description: 'Export format.' },
          export_path: { type: 'string', description: 'Export file path.' },
        },
        required: ['operation'],
      },
      output: {
        schema: { type: 'object' },
        render: function (_a, v) {
          if (!v.success) return [{ type: 'text', text: '❌ ' + (v.result && v.result.error || 'Failed') }];
          return [{ type: 'text', text: '✅ ' + (v.result && v.result.message || 'ok') }];
        },
      },
      execute: async function (args) {
        var code = 'import bpy\n';
        var resultMsg = 'ok';

        switch (args.operation) {
          case 'clear':
            code += 'bpy.ops.object.select_all(action="SELECT")\nbpy.ops.object.delete(use_global=False)\n# Also clear meshes, materials, etc.\nfor block in bpy.data.meshes:\n  bpy.data.meshes.remove(block)\nfor block in bpy.data.materials:\n  bpy.data.materials.remove(block)\nfor block in bpy.data.lights:\n  bpy.data.lights.remove(block)\nfor block in bpy.data.cameras:\n  bpy.data.cameras.remove(block)';
            resultMsg = 'scene cleared';
            break;

          case 'light_add':
            code += 'light_type = params.get("light_type", "POINT")\n';
            code += 'bpy.ops.object.light_add(type=light_type)\n';
            code += 'light = bpy.context.active_object\n';
            code += 'light.location = params.get("location", [5, -5, 5])\n';
            code += 'light.data.energy = params.get("light_energy", 500)\n';
            code += 'col = params.get("light_color")\n';
            code += 'if col: light.data.color = (col[0], col[1], col[2])\n';
            code += 'if light_type == "AREA" and "light_size" in params:\n  light.data.size = params["light_size"]\n';
            resultMsg = 'light added';
            break;

          case 'camera_add':
            code += 'bpy.ops.object.camera_add()\n';
            code += 'cam = bpy.context.active_object\n';
            code += 'loc = params.get("camera_location", [7, -7, 5])\n';
            code += 'cam.location = (loc[0], loc[1], loc[2])\n';
            code += 'target = params.get("camera_target", [0, 0, 0])\n';
            code += 'direction = (target[0] - loc[0], target[1] - loc[1], target[2] - loc[2])\n';
            code += 'import mathutils\n';
            code += 'cam.rotation_euler = mathutils.Vector(direction).to_track_quat("-Z", "Y").to_euler()\n';
            code += 'if "camera_lens" in params:\n  cam.data.lens = params["camera_lens"]\n';
            code += 'bpy.context.scene.camera = cam\n';
            resultMsg = 'camera added';
            break;

          case 'ground_add':
            code += 'bpy.ops.mesh.primitive_plane_add(size=params.get("size", 20), location=(0, 0, 0))\n';
            code += 'ground = bpy.context.active_object\n';
            code += 'ground.name = "Ground"\n';
            code += 'mat = bpy.data.materials.new("Ground_mat")\n';
            code += 'mat.use_nodes = True\n';
            code += 'bsdf = mat.node_tree.nodes.get("Principled BSDF")\n';
            code += 'col = params.get("color", [0.2, 0.2, 0.2])\n';
            code += 'bsdf.inputs["Base Color"].default_value = col + [1.0] if len(col) == 3 else col\n';
            code += 'bsdf.inputs["Roughness"].default_value = 0.8\n';
            code += 'if ground.data.materials:\n  ground.data.materials[0] = mat\n';
            code += 'else:\n  ground.data.materials.append(mat)\n';
            resultMsg = 'ground plane added';
            break;

          case 'render_settings':
            code += 'scene = bpy.context.scene\n';
            code += 'if "engine" in params:\n  scene.render.engine = params["engine"]\n';
            code += 'if "resolution_x" in params:\n  scene.render.resolution_x = params["resolution_x"]\n';
            code += 'if "resolution_y" in params:\n  scene.render.resolution_y = params["resolution_y"]\n';
            code += 'if "samples" in params:\n';
            code += '  if scene.render.engine == "CYCLES":\n    scene.cycles.samples = params["samples"]\n';
            code += '  elif scene.render.engine == "BLENDER_EEVEE_NEXT":\n    scene.eevee.taa_render_samples = params["samples"]\n';
            code += 'if "transparent" in params:\n  scene.render.film_transparent = params["transparent"]\n';
            resultMsg = 'render settings updated';
            break;

          case 'render':
            code += 'scene = bpy.context.scene\n';
            code += 'output = params.get("output_path", "")\n';
            code += 'if not output:\n  output = "/home/user/blender-dsh/output/render_" + str(int(__import__("time").time())) + ".png"\n';
            code += 'scene.render.filepath = output\n';
            code += 'if "engine" in params:\n  scene.render.engine = params["engine"]\n';
            code += 'if "resolution_x" in params:\n  scene.render.resolution_x = params["resolution_x"]\n';
            code += 'if "resolution_y" in params:\n  scene.render.resolution_y = params["resolution_y"]\n';
            code += 'if "samples" in params and scene.render.engine == "CYCLES":\n  scene.cycles.samples = params["samples"]\n';
            code += 'if "transparent" in params:\n  scene.render.film_transparent = params["transparent"]\n';
            code += 'bpy.ops.render.render(write_still=True)\n';
            code += 'print(json.dumps({"status":"ok","message":"rendered","output_path":output}))\nreturn';
            resultMsg = 'rendered';
            // Don't add the default JSON print since we do it inline
            break;

          case 'world_set':
            code += 'world = bpy.context.scene.world\n';
            code += 'if world is None:\n  world = bpy.data.worlds.new("World")\n  bpy.context.scene.world = world\n';
            code += 'world.use_nodes = True\n';
            code += 'bg = world.node_tree.nodes.get("Background")\n';
            code += 'if bg is None:\n  bg = world.node_tree.nodes.new("ShaderNodeBackground")\n';
            code += 'output = world.node_tree.nodes.get("World Output")\n';
            code += 'if output is None:\n  output = world.node_tree.nodes.new("ShaderNodeOutputWorld")\n  world.node_tree.links.new(bg.outputs["Background"], output.inputs["Surface"])\n';
            code += 'col = params.get("world_color", [0.05, 0.05, 0.05])\n';
            code += 'bg.inputs["Color"].default_value = (col[0], col[1], col[2], 1.0)\n';
            resultMsg = 'world set';
            break;

          case 'export':
            code += 'export_fmt = params.get("export_format", "OBJ")\n';
            code += 'export_path = params.get("export_path", "/home/user/blender-dsh/output/export." + export_fmt.lower())\n';
            code += 'if export_fmt == "OBJ":\n  bpy.ops.wm.obj_export(filepath=export_path)\n';
            code += 'elif export_fmt == "FBX":\n  bpy.ops.export_scene.fbx(filepath=export_path)\n';
            code += 'elif export_fmt == "GLB":\n  bpy.ops.export_scene.gltf(filepath=export_path, export_format="GLB")\n';
            code += 'elif export_fmt == "STL":\n  bpy.ops.wm.stl_export(filepath=export_path)\n';
            code += 'elif export_fmt == "PLY":\n  bpy.ops.wm.ply_export(filepath=export_path)\n';
            code += 'else:\n  raise ValueError("Export format not supported: " + export_fmt)\n';
            code += 'print(json.dumps({"status":"ok","message":"exported","output_path":export_path,"format":export_fmt}))\nreturn';
            break;
        }

        if (args.operation !== 'render' && args.operation !== 'export') {
          code += '\nprint(json.dumps({"status":"ok","message":"' + resultMsg + '"}))';
        }

        var fullScript = makeScript(code, args);
        return await blenderExec(fullScript);
      },
    }));

    // ================================================================
    // Tool 5: blender_info - Query scene/object information
    // ================================================================
    harness.registerTool(ctx, harness.defineTool({
      name: 'blender_info',
      description: 'Query information about the current Blender scene, objects, materials, and render settings.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Type of information to query.',
            enum: ['scene_summary', 'object_list', 'object_info', 'object_tree', 'material_list', 'stats', 'render_settings'],
          },
          object: { type: 'string', description: 'Object name (for object_info query).' },
        },
        required: ['query'],
      },
      output: {
        schema: { type: 'object' },
        render: function (_a, v) {
          if (!v.success) return [{ type: 'text', text: '❌ Query failed' }];
          var info = v.result && v.result.info;
          if (info) {
            return [{ type: 'text', text: typeof info === 'string' ? info : JSON.stringify(info, null, 2) }];
          }
          return [{ type: 'text', text: '✅ Query completed' }];
        },
      },
      execute: async function (args) {
        var code = 'import bpy\n';
        var query = args.query;

        if (query === 'scene_summary') {
          code += 'scene = bpy.context.scene\n';
          code += 'info = {\n  "scene": scene.name,\n  "objects_count": len(scene.objects),\n  "objects": [o.name for o in scene.objects],\n  "camera": scene.camera.name if scene.camera else None,\n  "world": scene.world.name if scene.world else None,\n  "render_engine": scene.render.engine,\n  "resolution": [scene.render.resolution_x, scene.render.resolution_y],\n  "samples": getattr(scene.cycles, "samples", 0) if scene.render.engine == "CYCLES" else 0,\n}\nprint(json.dumps({"status":"ok","info":info}))';
        } else if (query === 'object_list') {
          code += 'objs = [{"name":o.name,"type":o.type,"location":list(o.location),"vertices":len(o.data.vertices) if hasattr(o.data,"vertices") else 0} for o in bpy.context.scene.objects]\nprint(json.dumps({"status":"ok","info":objs}))';
        } else if (query === 'object_info') {
          code += 'obj = bpy.data.objects.get(params.get("object", ""))\nif obj is None:\n  raise ValueError("Object not found: " + str(params.get("object", "")))\ninfo = {\n  "name": obj.name,\n  "type": obj.type,\n  "location": list(obj.location),\n  "rotation": list(obj.rotation_euler),\n  "scale": list(obj.scale),\n  "vertices": len(obj.data.vertices) if hasattr(obj.data, "vertices") else 0,\n  "faces": len(obj.data.polygons) if hasattr(obj.data, "polygons") else 0,\n  "modifiers": [m.name + ":" + m.type for m in obj.modifiers],\n  "materials": [m.name for m in obj.data.materials] if hasattr(obj.data, "materials") else [],\n}\nprint(json.dumps({"status":"ok","info":info}))';
        } else if (query === 'object_tree') {
          code += 'tree = []\nfor o in bpy.context.scene.objects:\n  tree.append({"name":o.name,"type":o.type,"parent":o.parent.name if o.parent else None,"children":[c.name for c in o.children]})\nprint(json.dumps({"status":"ok","info":tree}))';
        } else if (query === 'material_list') {
          code += 'mats = [{"name":m.name,"nodes":len(m.node_tree.nodes) if m.node_tree else 0} for m in bpy.data.materials]\nprint(json.dumps({"status":"ok","info":mats}))';
        } else if (query === 'stats') {
          code += 'scene = bpy.context.scene\ninfo = {\n  "total_objects": len(bpy.data.objects),\n  "total_meshes": len(bpy.data.meshes),\n  "total_materials": len(bpy.data.materials),\n  "total_lights": len(bpy.data.lights),\n  "total_cameras": len(bpy.data.cameras),\n  "total_vertices": sum(len(o.data.vertices) for o in bpy.data.objects if hasattr(o.data, "vertices")),\n  "total_faces": sum(len(o.data.polygons) for o in bpy.data.objects if hasattr(o.data, "polygons")),\n}\nprint(json.dumps({"status":"ok","info":info}))';
        } else if (query === 'render_settings') {
          code += 'scene = bpy.context.scene\ninfo = {\n  "engine": scene.render.engine,\n  "resolution": [scene.render.resolution_x, scene.render.resolution_y],\n  "resolution_percentage": scene.render.resolution_percentage,\n  "file_format": scene.render.image_settings.file_format,\n  "color_mode": scene.render.image_settings.color_mode,\n  "film_transparent": scene.render.film_transparent,\n}\nif scene.render.engine == "CYCLES":\n  info["cycles_samples"] = scene.cycles.samples\n  info["denoising"] = scene.cycles.use_denoising\n  info["device"] = scene.cycles.device\nprint(json.dumps({"status":"ok","info":info}))';
        }

        var fullScript = makeScript(code, args);
        return await blenderExec(fullScript);
      },
    }));

    // ================================================================
    // Optional: Client RPC handler for status updates
    // ================================================================
    harness.handle('blender-status', function (args) {
      return { status: 'ready', blender: BLENDER_PATH, outputDir: OUTPUT_DIR };
    });

    console.log('[Blender] Plugin loaded. Blender path: ' + BLENDER_PATH);
  },
};