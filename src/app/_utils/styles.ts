import 'react-quill/dist/quill.snow.css'

export const ReactQuillStyles = {
    modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'align': [] }],
          ['link']
        ]
      },
      formats: [
        'header',
        'bold', 
        'italic', 
        'underline', 
        'strike',
        'list', 
        'bullet',
        'color',
        'background',
        'align',
        'link'
      ]
}