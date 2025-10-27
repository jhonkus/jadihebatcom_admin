<script lang="ts">
  import Editor from '@tinymce/tinymce-svelte';
  export let lesson: any;
</script>

<Editor
  apiKey="2nvms11dslnngrljimctrmszuebr1j7gwqnxwpdlf01y6ckc"
  value={lesson.content}
  on:change={(e) => lesson.content = e.detail.value}
  conf={{
    height: 400,
    menubar: false,
    plugins: 'lists link image codesample',
    toolbar: 'bold italic underline | bullist numlist | link image | codesample',
    content_style: `
      body { font-family:Helvetica,Arial,sans-serif; font-size:14px }
      pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
      code { background: #f4f4f4; padding: 2px 4px; border-radius: 2px; font-family: 'Courier New', monospace; }
      pre code { background: none; padding: 0; }
    `,
    codesample_languages: [
      { text: 'HTML/XML', value: 'markup' },
      { text: 'JavaScript', value: 'javascript' },
      { text: 'CSS', value: 'css' },
      { text: 'PHP', value: 'php' },
      { text: 'Ruby', value: 'ruby' },
      { text: 'Python', value: 'python' },
      { text: 'Java', value: 'java' },
      { text: 'C', value: 'c' },
      { text: 'C#', value: 'csharp' },
      { text: 'C++', value: 'cpp' }
    ]
  }}
/>

<style>
/* TinyMCE styles handled by the component */
</style>