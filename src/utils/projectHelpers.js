export const isOwner = (user, project) => {
  return (
    user && user.profile && 
    (user.profile.user === project.user_id || !project.identifier)
  )
}
  