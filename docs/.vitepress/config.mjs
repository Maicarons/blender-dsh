import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Blender DSH Plugin',
  description: 'AI-powered Blender 3D modeling plugin for DeepSeek Harness',
  lang: 'zh-CN',

  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    logo: '/blender-icon.png',

    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: '工具', link: '/tools/overview' },
      { text: '示例', link: '/examples/basic-scene' },
      { text: '开发', link: '/development/architecture' },
      { text: 'English', link: '/en/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '配置', link: '/guide/configuration' },
            { text: '使用流程', link: '/guide/workflow' },
          ],
        },
      ],
      '/tools/': [
        {
          text: '工具参考',
          items: [
            { text: '概览', link: '/tools/overview' },
            { text: 'blender_execute', link: '/tools/execute' },
            { text: 'blender_create', link: '/tools/create' },
            { text: 'blender_modify', link: '/tools/modify' },
            { text: 'blender_scene', link: '/tools/scene' },
            { text: 'blender_info', link: '/tools/info' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础场景', link: '/examples/basic-scene' },
            { text: '螺旋楼梯', link: '/examples/spiral-staircase' },
            { text: '参数化建模', link: '/examples/parametric' },
            { text: '渲染管线', link: '/examples/render-workflow' },
            { text: '香蕉模型', link: '/examples/banana' },
            { text: '公寓楼', link: '/examples/apartment' },
          ],
        },
      ],
      '/development/': [
        {
          text: '开发指南',
          items: [
            { text: '架构', link: '/development/architecture' },
            { text: '插件开发', link: '/development/plugin-dev' },
            { text: 'API 参考', link: '/development/api' },
            { text: '贡献指南', link: '/development/contributing' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Maicarons/blender-dsh' },
    ],

    footer: {
      message: 'Released under the AGPL-3.0 License',
      copyright: 'Copyright © 2026',
    },

    editLink: {
      pattern: 'https://github.com/Maicarons/blender-dsh/edit/master/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
  },
})