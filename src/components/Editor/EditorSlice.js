import { createSlice } from '@reduxjs/toolkit'

export const EditorSlice = createSlice({
  name: 'editor',
  initialState: {
    code: "import turtle\nt = turtle.Turtle()\nt.forward(100)\nprint('100')",
    html_code: "<html>\n  <body>\n    <h1>Heading</h1>\n    <p>Paragraph</p>\n  </body>\n</html>",
    code_dict: {
      html: {
        index: "<html>\n  <body>\n    <h1>Heading</h1>\n    <p>Paragraph</p>\n  </body>\n</html>" ,
      }
    },
  },
  reducers: {
    update: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.code = action.payload
    },
    updateHtml: (state, action) => {
      state.html_code = action.payload
    },
    updateCodeDict: (state, action) => {
      const lang = action.payload.lang;
      const fileName = action.payload.name;
      const code = action.payload.code;
      state.code_dict[lang][fileName] = code;
    }
  },
})

// Action creators are generated for each case reducer function
export const { update, updateHtml, updateCodeDict } = EditorSlice.actions

export default EditorSlice.reducer
