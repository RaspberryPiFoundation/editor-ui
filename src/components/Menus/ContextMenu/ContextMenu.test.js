import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import ContextMenu from './ContextMenu'

const action1 = jest.fn()

describe("With file items", () => {

  beforeEach(() => {
    render(
      <ContextMenu
        MenuButtonIcon = {() => {}}
        menuOptions={[{text: 'option1', action: action1, icon: () => {}}]}
      />
    )
  })

  test("Menu is not visible initially", () => {
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  test("Clicking button makes menu content appear", () => {
    const button = screen.getByRole('button', { expanded: false })
    fireEvent.click(button)
    expect(screen.queryByRole('menu')).toBeInTheDocument()
  })

  test("Clicking option button calls action", () => {
    const button = screen.getByRole('button', { expanded: false })
    fireEvent.click(button)
    const menuOption = screen.queryByText('option1')
    fireEvent.click(menuOption)
    expect(action1).toHaveBeenCalled()
  })
})
