import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import classes from './index.module.scss'

type AddressFormProps = {
  userId: string
  initialAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  onSubmit: (address: Address) => void
  onAddressCompleteChange: (isComplete: boolean) => void
}

const AddressForm = forwardRef(
  ({ userId, initialAddress, onSubmit, onAddressCompleteChange }: AddressFormProps, ref) => {
    const [address, setAddress] = useState(
      initialAddress || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    )

    // Fetch address from server if needed
    useEffect(() => {
      const fetchAddress = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userId}`)
          const user = await res.json()
          if (user && user.address) {
            setAddress({
              street: user.address.street || '',
              city: user.address.city || '',
              state: user.address.state || '',
              postalCode: user.address.zipCode || '',
              country: user.address.country || '',
            })
          }
        } catch (error) {
          console.error('Error fetching address:', error)
        }
      }

      fetchAddress()
    }, [userId])

    // Function to check if the address is complete
    const checkAddressComplete = () => {
      return (
        address.street.trim() !== '' &&
        address.city.trim() !== '' &&
        address.state.trim() !== '' &&
        address.postalCode.trim() !== '' &&
        address.country.trim() !== ''
      )
    }

    // Effect to notify parent about address completion status
    useEffect(() => {
      onAddressCompleteChange(checkAddressComplete())
    }, [address, onAddressCompleteChange])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setAddress(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: {
              street: address.street,
              city: address.city,
              state: address.state,
              zipCode: address.postalCode,
              country: address.country,
            },
          }),
        })

        if (!res.ok) {
          throw new Error('Failed to update address')
        }

        onSubmit(address)
      } catch (error) {
        console.error('Error updating address:', error)
      }
    }

    useImperativeHandle(ref, () => ({
      submitAddress: handleSubmit,
    }))

    return (
      <div className={classes.formContainer}>
        <h3 className={classes.title}>Shipping Address</h3>
        <div className={classes.formGroup}>
          <label htmlFor="street">Street</label>
          <input
            type="text"
            name="street"
            id="street"
            value={address.street}
            onChange={handleChange}
            placeholder="Street"
            required
          />
        </div>
        <div className={classes.formGroup}>
          <label htmlFor="city">City</label>
          <input
            type="text"
            name="city"
            id="city"
            value={address.city}
            onChange={handleChange}
            placeholder="City"
            required
          />
        </div>
        <div className={classes.formGroup}>
          <label htmlFor="state">State</label>
          <input
            type="text"
            name="state"
            id="state"
            value={address.state}
            onChange={handleChange}
            placeholder="State"
            required
          />
        </div>
        <div className={classes.formGroup}>
          <label htmlFor="postalCode">Postal Code</label>
          <input
            type="text"
            name="postalCode"
            id="postalCode"
            value={address.postalCode}
            onChange={handleChange}
            placeholder="Postal Code"
            required
          />
        </div>
        <div className={classes.formGroup}>
          <label htmlFor="country">Country</label>
          <input
            type="text"
            name="country"
            id="country"
            value={address.country}
            onChange={handleChange}
            placeholder="Country"
            required
          />
        </div>
      </div>
    )
  },
)

export default AddressForm
