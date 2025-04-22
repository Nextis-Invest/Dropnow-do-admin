import { NextRequest, NextResponse } from "next/server";

// Mock geocoding API response
const mockGeocodingResults = [
  {
    formatted_address: "123 Main St, New York, NY 10001, USA",
    geometry: {
      location: {
        lat: 40.7128,
        lng: -74.006,
      },
    },
  },
  {
    formatted_address: "456 Broadway, New York, NY 10013, USA",
    geometry: {
      location: {
        lat: 40.7193,
        lng: -74.0007,
      },
    },
  },
  {
    formatted_address: "789 5th Avenue, New York, NY 10022, USA",
    geometry: {
      location: {
        lat: 40.7636,
        lng: -73.9729,
      },
    },
  },
  {
    formatted_address: "1 World Trade Center, New York, NY 10007, USA",
    geometry: {
      location: {
        lat: 40.7127,
        lng: -74.0134,
      },
    },
  },
  {
    formatted_address: "Empire State Building, New York, NY 10001, USA",
    geometry: {
      location: {
        lat: 40.7484,
        lng: -73.9857,
      },
    },
  },
  {
    formatted_address: "Central Park, New York, NY 10022, USA",
    geometry: {
      location: {
        lat: 40.7812,
        lng: -73.9665,
      },
    },
  },
  {
    formatted_address: "Times Square, New York, NY 10036, USA",
    geometry: {
      location: {
        lat: 40.7589,
        lng: -73.9851,
      },
    },
  },
  {
    formatted_address: "Brooklyn Bridge, New York, NY 10038, USA",
    geometry: {
      location: {
        lat: 40.7061,
        lng: -73.9969,
      },
    },
  },
  {
    formatted_address: "Grand Central Terminal, New York, NY 10017, USA",
    geometry: {
      location: {
        lat: 40.7527,
        lng: -73.9772,
      },
    },
  },
  {
    formatted_address: "Statue of Liberty, New York, NY 10004, USA",
    geometry: {
      location: {
        lat: 40.6892,
        lng: -74.0445,
      },
    },
  },
  // European addresses
  {
    formatted_address: "Eiffel Tower, Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
    geometry: {
      location: {
        lat: 48.8584,
        lng: 2.2945,
      },
    },
  },
  {
    formatted_address: "Colosseum, Piazza del Colosseo, 1, 00184 Roma RM, Italy",
    geometry: {
      location: {
        lat: 41.8902,
        lng: 12.4922,
      },
    },
  },
  {
    formatted_address: "Sagrada Familia, Carrer de Mallorca, 401, 08013 Barcelona, Spain",
    geometry: {
      location: {
        lat: 41.4036,
        lng: 2.1744,
      },
    },
  },
  {
    formatted_address: "Brandenburg Gate, Pariser Platz, 10117 Berlin, Germany",
    geometry: {
      location: {
        lat: 52.5163,
        lng: 13.3777,
      },
    },
  },
  {
    formatted_address: "Big Ben, London SW1A 0AA, United Kingdom",
    geometry: {
      location: {
        lat: 51.5007,
        lng: -0.1246,
      },
    },
  },
];

export async function GET(request: NextRequest) {
  // Get the query parameter
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Filter mock results based on query
  const filteredResults = mockGeocodingResults.filter((result) =>
    result.formatted_address.toLowerCase().includes(query.toLowerCase())
  );

  // Return the filtered results
  return NextResponse.json(filteredResults);
}
