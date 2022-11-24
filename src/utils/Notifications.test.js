import { toast } from 'react-toastify'
import { showRemixedMessage, showSavedMessage } from "./Notifications";

jest.mock('../i18n', () => ({
  t: (string) => string
}))
jest.mock('react-toastify')

test('Calling showRemixedMessage calls toast with correct string', () => {
  showRemixedMessage()
  expect(toast).toHaveBeenCalledWith('notifications.projectRemixed', expect.anything())
})

test('Calling showSavedMessage calls toast with correct string', () => {
  showSavedMessage()
  expect(toast).toHaveBeenCalledWith('notifications.projectSaved', expect.anything())
})
