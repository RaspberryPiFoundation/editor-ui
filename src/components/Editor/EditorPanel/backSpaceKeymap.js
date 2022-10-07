const simulateCtrlBackspace = () => {
  console.log('deleting')
  document.dispatchEvent(new KeyboardEvent('keypress', {'key': 'Ctrl+Backspace'}))
}

export const backspaceKeymap = {
  mac: 'Backspace',
  run: simulateCtrlBackspace,
  preventDefault: true
}
