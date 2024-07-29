export const RESET_PASSWORD = `
  mutation ResetPassword($email: String!) {
    resetPassword(email: $email) {
      success
      message
    }
  }
`
