# Address Autocomplete Feature

This document explains how to set up and use the address autocomplete feature in the ride creation form.

## Setup

1. Get a free MapBox access token from the [MapBox website](https://account.mapbox.com/)

   - Sign up for a free account
   - Create a new access token with the "Geocoding" scope enabled
   - The free tier includes 100,000 geocoding requests per month

2. Create a `.env.local` file in the root of your project and add your access token:

   ```
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
   ```

3. Restart your development server to apply the environment variable changes.

## How It Works

The address autocomplete feature uses the MapBox Geocoding API to provide suggestions as the user types in the pickup and dropoff address fields. When a suggestion is selected, the component automatically extracts the coordinates (latitude and longitude) and stores them in the form data.

### Key Components

- `AddressAutocomplete.tsx`: A reusable component that wraps the Input component and adds autocomplete functionality
- `LocationDetailsStep.tsx`: Uses the AddressAutocomplete component for pickup and dropoff address fields

### Features

- Real-time suggestions as the user types
- Automatic extraction of coordinates when a suggestion is selected
- Fallback to regular input for airport transfers with flight data
- Customizable placeholder text and styling

## Usage in Other Forms

You can reuse the `AddressAutocomplete` component in other forms by importing it and using it like this:

```tsx
import { AddressAutocomplete } from "@/components/forms/ride-form/form-helpers/AddressAutocomplete";

// In your form component
<AddressAutocomplete
  placeholder="Enter an address"
  defaultValue={initialAddress}
  onAddressSelect={(address, lat, lng) => {
    // Handle the selected address and coordinates
    console.log("Selected address:", address);
    console.log("Coordinates:", lat, lng);

    // Update your form values
    form.setValue("address", address);
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
  }}
/>;
```

## Customization

You can customize the behavior of the address autocomplete by modifying the `AddressAutocomplete.tsx` file:

- Change the country restriction by modifying the `country` parameter (e.g., "fr" for France)
- Adjust the types of results by modifying the `types` parameter in the API URL
- Change the number of suggestions by modifying the `limit` parameter
- Customize the appearance of the suggestions dropdown by modifying the CSS classes

## Troubleshooting

- If you see a "MapBox API error" message, check that your access token is correct and properly set in the `.env.local` file
- If the autocomplete doesn't show any suggestions, make sure you've typed at least 3 characters
- If you're getting rate limit errors, check your MapBox account usage dashboard
- The component requires at least 3 characters before it starts searching to avoid excessive API calls
