/**
 * Pincode Lookup Service
 * Primary: api.postalpincode.in
 * Fallback: OpenStreetMap Nominatim (if primary fails/times out)
 */

const POSTAL_API_BASE = "https://api.postalpincode.in/pincode";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

/**
 * Fetch with timeout
 */
const fetchWithTimeout = (url, options = {}, timeoutMs = 5000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
};

/**
 * Try the old India Post API first
 */
const tryPostalApi = async (pincode) => {
  try {
    const response = await fetchWithTimeout(
      `${POSTAL_API_BASE}/${pincode}`,
      {},
      5000
    );
    const data = await response.json();

    if (data && data[0]?.Status === "Success") {
      const offices = data[0].PostOffice || [];
      if (offices.length > 0) {
        return {
          success: true,
          state: offices[0].State || "",
          district: offices[0].District || "",
          postOffices: offices,
        };
      }
    }
    return null; // Signal to try fallback
  } catch (error) {
    console.warn("Postal API failed, trying fallback:", error.message);
    return null; // Signal to try fallback
  }
};

/**
 * Fallback: use OpenStreetMap Nominatim
 */
const tryNominatimApi = async (pincode) => {
  try {
    const response = await fetchWithTimeout(
      `${NOMINATIM_BASE}/search?postalcode=${pincode}&country=India&format=json&addressdetails=1&limit=10`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "TeacherGotHire-Frontend/1.0",
        },
      },
      8000
    );

    const data = await response.json();

    if (!data || data.length === 0) {
      return { success: false, state: "", district: "", postOffices: [] };
    }

    const firstResult = data[0];
    const address = firstResult.address || {};
    const state = address.state || "";
    const district = (
      address.state_district ||
      address.county ||
      address.city ||
      address.town ||
      ""
    )
      .replace(/ District$/i, "")
      .trim();

    // Build post offices list from all results
    const postOfficeSet = new Set();
    const postOffices = [];

    data.forEach((result) => {
      const addr = result.address || {};
      const areaName =
        addr.suburb ||
        addr.neighbourhood ||
        addr.village ||
        addr.town ||
        addr.city_district ||
        addr.hamlet ||
        "";

      if (areaName && !postOfficeSet.has(areaName)) {
        postOfficeSet.add(areaName);
        postOffices.push({
          Name: areaName,
          District:
            (
              addr.state_district ||
              addr.county ||
              addr.city ||
              district
            )
              .replace(/ District$/i, "")
              .trim(),
          State: addr.state || state,
        });
      }
    });

    // If no areas found, add the district as fallback
    if (postOffices.length === 0 && district) {
      postOffices.push({
        Name: district,
        District: district,
        State: state,
      });
    }

    return {
      success: postOffices.length > 0,
      state,
      district,
      postOffices,
    };
  } catch (error) {
    console.error("Nominatim API also failed:", error);
    return { success: false, state: "", district: "", postOffices: [] };
  }
};

/**
 * Lookup pincode details - tries India Post API first, falls back to Nominatim
 * @param {string} pincode - 6-digit Indian pincode
 * @returns {Promise<{success: boolean, state: string, district: string, postOffices: Array<{Name: string, District: string, State: string}>}>}
 */
export const lookupPincode = async (pincode) => {
  if (!pincode || pincode.length !== 6) {
    return { success: false, state: "", district: "", postOffices: [] };
  }

  // Try primary API first
  const postalResult = await tryPostalApi(pincode);
  if (postalResult) {
    return postalResult;
  }

  // Fallback to Nominatim
  console.log("Using Nominatim fallback for pincode:", pincode);
  return tryNominatimApi(pincode);
};

/**
 * Reverse geocode coordinates to get address details
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{pincode: string, district: string, state: string}>}
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetchWithTimeout(
      `${NOMINATIM_BASE}/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "TeacherGotHire-Frontend/1.0",
        },
      },
      8000
    );

    if (!response.ok) {
      throw new Error(`Reverse geocode error: ${response.status}`);
    }

    const data = await response.json();
    const address = data?.address || {};

    return {
      pincode: address.postcode || "",
      district: (address.state_district || address.county || "")
        .replace(/ District$/i, "")
        .trim(),
      state: address.state || "",
    };
  } catch (error) {
    console.error("Reverse geocode failed:", error);
    return { pincode: "", district: "", state: "" };
  }
};

export default { lookupPincode, reverseGeocode };
