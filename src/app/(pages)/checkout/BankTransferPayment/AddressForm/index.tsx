import React, { useState } from 'react'

interface AddressFormProps {
  initialAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  onSubmit: (address: AddressFormProps['initialAddress']) => void
}
const AddressForm: React.FC<AddressFormProps> = ({ initialAddress, onSubmit }) => {
  const [address, setAddress] = useState(
    initialAddress || {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  )
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(address)
  }
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="street"
        value={address.street}
        onChange={handleChange}
        placeholder="Street"
        required
      />
      <input
        type="text"
        name="city"
        value={address.city}
        onChange={handleChange}
        placeholder="City"
        required
      />
      <input
        type="text"
        name="state"
        value={address.state}
        onChange={handleChange}
        placeholder="State"
        required
      />
      <input
        type="text"
        name="postalCode"
        value={address.postalCode}
        onChange={handleChange}
        placeholder="Postal Code"
        required
      />
      <input
        type="text"
        name="country"
        value={address.country}
        onChange={handleChange}
        placeholder="Country"
        required
      />
      <button type="submit">Confirm Address</button>
    </form>
  )
}

export default AddressForm
