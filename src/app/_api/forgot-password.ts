import type { NextApiRequest, NextApiResponse } from 'next'
import payload from 'payload'
import { fetchDoc } from './fetchDoc'
import { RESET_PASSWORD } from '../_graphql/resetPassword'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  const { email, newPassword, token } = req.body

  if (!email || !newPassword || !token) {
    return res.status(400).send('All fields are required')
  }

  try {
    // Fetch the user document to validate the email
    const user = await fetchDoc({
      collection: 'users',
      id: email,
      draft: false,
    })

    if (!user) {
      return res.status(404).send('User not found')
    }

    // Assuming you have a function to validate the reset token
    const isTokenValid = validateResetToken(token, email)
    if (!isTokenValid) {
      return res.status(400).send('Invalid or expired token')
    }

    // Perform the password reset operation
    const response = await fetch(`${process.env.GRAPHQL_API_URL}/api/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: RESET_PASSWORD,
        variables: {
          email,
          newPassword,
        },
      }),
    }).then(graphqlRes => graphqlRes.json()) // Rename 'res' to 'graphqlRes'

    if (response.errors) {
      throw new Error(response.errors[0].message || 'Error resetting password')
    }

    // Send a confirmation email (if needed)
    await payload.sendEmail({
      to: email,
      from: {
        name: 'Smoking-Austria',
        address: process.env.EMAIL_SALES,
      },
      subject: 'Password Reset Successful',
      text: 'Your password has been reset successfully.',
    })

    return res.status(200).json({ message: 'Password reset successfully' })
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).send(error.message)
    }
    return res.status(500).send('An unknown error occurred')
  }
}

// Example function for validating reset token (implementation needed)
const validateResetToken = (token: string, email: string): boolean => {
  console.log(token, email)
  return true
}
