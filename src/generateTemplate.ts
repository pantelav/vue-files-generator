import { IWebData } from './extension';

const templateHtml = `<template>

</template>
`;

const generateCapiImports = (webData: IWebData) => {
  if (!webData.ref && !webData.reactive && !webData.onMounted && !webData.watch && !webData.computed) return '';
  const imports = `import { ${webData.ref ? 'ref,' : ''}${webData.reactive ? ' reactive,' : ''}${webData.computed ? ' computed,' : ''}${webData.onMounted ? ' onMounted,' : ''}${webData.watch ? ' watch,' : ''} } from "vue"`;
  return imports;
};

const generateOapiImports = (webData: IWebData) => {
  let mounted = ''
  let computed = ''
  let watch = ''
  const data = `data() {
    return {

    }  
  },
  methods: {

  },
  `
  if (webData.onMounted) {
    mounted = `mounted() {

  },
  `
  }
  if (webData.computed) {
    computed = `computed: {

  },
  `
  }
  if (webData.watch) {
    watch = `watch: {

  },
  `
  }
  if (webData.ts) {
    return `import { defineComponent } from "vue"

export default defineComponent ({
  ${data}${watch}${computed}${mounted}
})`
  } else {
    return `export default {
  ${data}${watch}${computed}${mounted}
}`
  }
}

const scriptHtml = (webData: IWebData) => {
  return `<script${webData.mode === 'capi' ? ' setup' : ''}${webData.ts && webData.mode === 'capi' ? ' lang="ts"' : ''}>
${webData.mode === 'capi' ? generateCapiImports(webData) : generateOapiImports(webData)}

</script>
`;
};

const styleHtml = (scoped: boolean, css: 'css' | 'scss' | 'sass') => {
  return `<style${scoped ? ' scoped' : ''}${css === 'scss' ? ' lang="scss"' : css === 'sass' ? ' lang="sass"' : ''}>

</style>
`;
};

export function generateTemplate (webData: IWebData) {
  return `${templateHtml}
${scriptHtml(webData)}
${styleHtml(webData.scoped, webData.css)}`;
}