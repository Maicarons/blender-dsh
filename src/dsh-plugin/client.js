// Blender DSH Plugin - Client Side
// Provides UI feedback for Blender operations in the conversation flow
// Licensed under AGPL-3.0

return {
  apply(ctx) {
    var slots = ctx.get('slots');
    if (slots === undefined) return;

    // Register a tool view for Blender tools
    slots.inject('tool.view.cordis', function () {
      return slots.register(
        { name: 'tool.view.cordis', key: 'self' },
        function (props) {
          // Extract the tool call info from props
          var toolName = (props && props.toolName) || '';
          var result = (props && props.result) || {};

          // Only show for our blender tools
          var blenderTools = ['blender_execute', 'blender_create', 'blender_modify', 'blender_scene', 'blender_info'];
          if (blenderTools.indexOf(toolName) === -1) return null;

          var success = result && result.success;
          var statusClass = success ? 'blender-status-ok' : 'blender-status-err';

          return React.createElement('div', {
            className: 'blender-plugin-card ' + statusClass,
            style: {
              border: '1px solid ' + (success ? '#4caf50' : '#f44336'),
              borderRadius: '8px',
              padding: '8px 12px',
              margin: '4px 0',
              background: success ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)',
              fontSize: '13px',
            },
          },
            React.createElement('div', {
              style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
            },
              React.createElement('span', {
                style: { fontSize: '16px' },
              }, success ? '✅' : '❌'),
              React.createElement('strong', null, 'Blender: ' + (result && result.result && result.result.object || result.result && result.result.message || toolName)),
            ),
            React.createElement('div', {
              style: { color: '#888', fontSize: '12px', marginTop: '2px' },
            },
              'Exit: ' + (result && result.exitCode !== undefined ? result.exitCode : 'unknown'),
              result && result.timedOut ? ' (timed out)' : '',
            ),
          );
        },
      );
    });

    // Register a settings section for Blender configuration
    slots.inject('settings.section', function () {
      return slots.register(
        { name: 'settings.section', id: 'blender-config', order: 50, label: 'Blender' },
        function () {
          return React.createElement('div', {
            style: { padding: '16px' },
          },
            React.createElement('h3', null, 'Blender Plugin'),
            React.createElement('p', {
              style: { color: '#888', fontSize: '14px' },
            }, 'Configure Blender integration for 3D model generation.'),
            React.createElement('div', {
              style: { marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' },
            },
              React.createElement('strong', null, 'Available Tools:'),
              React.createElement('ul', { style: { marginTop: '8px', paddingLeft: '20px' } },
                React.createElement('li', null, 'blender_execute - Run arbitrary Python code'),
                React.createElement('li', null, 'blender_create - Create 3D objects'),
                React.createElement('li', null, 'blender_modify - Transform, add modifiers, materials'),
                React.createElement('li', null, 'blender_scene - Manage scenes, lights, rendering'),
                React.createElement('li', null, 'blender_info - Query scene information'),
              ),
            ),
          );
        },
      );
    });
  },
};