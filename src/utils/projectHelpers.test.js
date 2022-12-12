import { isOwner } from './projectHelpers'

describe('With logged in user', () => {
  const user = {
    profile: {
      user: 'cd8a5b3d-f7bb-425e-908f-1386decd6bb1'
    }
  }

  describe('who owns current project', () => {
    const project = {
      identifier: 'hot-diggity-dog',
      user_id: 'cd8a5b3d-f7bb-425e-908f-1386decd6bb1'
    }

    test('isOwner returns true', () => {
      expect(isOwner(user, project)).toBeTruthy()
    })
  })

  describe('who does not own current project', () => {
    const project = {
      identifier: 'hot-diggity-dog',
      user_id: '14f7d384-9e55-470f-b4cc-961236e1becb'
    }

    test('isOwner returns false', () => {
      expect(isOwner(user, project)).toBeFalsy()
    })
  })

  describe('and unsaved project', () => {
    const project = {
      identifier: undefined,
    }

    test('isOwner returns true', () => {
      expect(isOwner(user, project)).toBeTruthy()
    })
  })
})

describe('With no active user', () => {
  const user = undefined

  describe('and public project', () => {
    const project = {
      identifier: 'blue-suede-shoes',
      user_id: undefined
    }

    test('isOwner returns false', () => {
      expect(isOwner(user, project)).toBeFalsy()
    })
  })

  describe('and private project', () => {
    const project = {
      identifier: 'rock-around-clock',
      user_id: 'cee6040f-caf6-4029-b758-98f5ad9c0c7a'
    }

    test('isOwner returns false', () => {
      expect(isOwner(user, project)).toBeFalsy()
    })
  })

  describe('and unsaved project', () => {
    const project = {
      identifier: undefined,
    }

    test('isOwner returns false', () => {
      expect(isOwner(user, project)).toBeFalsy()
    })
  })
})
