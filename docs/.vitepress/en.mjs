import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'Blender DSH Plugin',
  description: 'AI-powered Blender 3D modeling plugin for DeepSeek Harness',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/en/' },
      { text: 'Guide', link: '/en/guide/getting-started' },
      { text: 'Tools', link: '/en/tools/overview' },
      { text: 'Examples', link: '/en/examples/basic-scene' },
      { text:中文', link: '/' },
    ],

    sidebar: {
      '/en/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Quick Start', link: '/en/guide/getting-started' },
            { text: 'Installation', link: '/en/guide/installation' },
            { text: 'Configuration', link: '/en/guide/configuration' },
            { text: 'Workflow', link: '/en/guide/workflow' },
          ],
        },
      ],
      '/en/tools/': [
        {
          text: 'Tool Reference',
          items: [
            { text: 'Overview', link: '/en/tools/overview' },
            { text: 'blender_execute', link: '/en/tools/execute' },
            { text: 'blender_create', link: '/en/tools/create' },
            { text: 'blender_modify', link: '/en/tools/modify' },
            { text: 'blender_scene', link: '/en/tools/scene' },
            { text: 'blender_info', link: '/en/tools/info' },
          ],
        },
      ],
      '/en/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Scene', link: '/en/examples/basic-scene' },
            { text: 'Spiral Staircase', link: '/en/examples/spiral-staircase' },
            { text: 'Parametric Modeling', link: '/en/examples/parametric' },
            { text: 'Render Pipeline', link: '/en/examples/render-workflow' },
            { text: 'Banana Model', link: '/en/examples/banana' },
            { text: 'Apartment Building', link: '/en/examples/apartment' },
          ],
        },
      ],
    },
  },
})