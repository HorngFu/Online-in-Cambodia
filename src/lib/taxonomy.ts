// Fixed lists shared by the Keystatic schema, the website and the validation
// script. Changing a `value` here means migrating existing content files.

export type Labelled<V extends string = string> = {
  value: V;
  label: string;
  labelKm: string;
};

export const listingTypes = [
  {
    value: "ngo",
    label: "NGO / non-profit",
    labelKm: "អង្គការមិនរកប្រាក់ចំណេញ",
  },
  { value: "company", label: "Company", labelKm: "ក្រុមហ៊ុន" },
  { value: "shop", label: "Shop", labelKm: "ហាង" },
  { value: "place", label: "Place", labelKm: "ទីកន្លែង" },
  { value: "brand", label: "Brand", labelKm: "ម៉ាក" },
  { value: "government", label: "Government", labelKm: "ស្ថាប័នរដ្ឋ" },
  {
    value: "school",
    label: "School / university",
    labelKm: "សាលា / សាកលវិទ្យាល័យ",
  },
  { value: "other", label: "Other", labelKm: "ផ្សេងៗ" },
] as const satisfies readonly Labelled[];

export const provinces = [
  { value: "phnom-penh", label: "Phnom Penh", labelKm: "ភ្នំពេញ" },
  {
    value: "banteay-meanchey",
    label: "Banteay Meanchey",
    labelKm: "បន្ទាយមានជ័យ",
  },
  { value: "battambang", label: "Battambang", labelKm: "បាត់ដំបង" },
  { value: "kampong-cham", label: "Kampong Cham", labelKm: "កំពង់ចាម" },
  {
    value: "kampong-chhnang",
    label: "Kampong Chhnang",
    labelKm: "កំពង់ឆ្នាំង",
  },
  { value: "kampong-speu", label: "Kampong Speu", labelKm: "កំពង់ស្ពឺ" },
  { value: "kampong-thom", label: "Kampong Thom", labelKm: "កំពង់ធំ" },
  { value: "kampot", label: "Kampot", labelKm: "កំពត" },
  { value: "kandal", label: "Kandal", labelKm: "កណ្ដាល" },
  { value: "kep", label: "Kep", labelKm: "កែប" },
  { value: "koh-kong", label: "Koh Kong", labelKm: "កោះកុង" },
  { value: "kratie", label: "Kratie", labelKm: "ក្រចេះ" },
  { value: "mondulkiri", label: "Mondulkiri", labelKm: "មណ្ឌលគិរី" },
  { value: "oddar-meanchey", label: "Oddar Meanchey", labelKm: "ឧត្តរមានជ័យ" },
  { value: "pailin", label: "Pailin", labelKm: "ប៉ៃលិន" },
  { value: "preah-sihanouk", label: "Preah Sihanouk", labelKm: "ព្រះសីហនុ" },
  { value: "preah-vihear", label: "Preah Vihear", labelKm: "ព្រះវិហារ" },
  { value: "prey-veng", label: "Prey Veng", labelKm: "ព្រៃវែង" },
  { value: "pursat", label: "Pursat", labelKm: "ពោធិ៍សាត់" },
  { value: "ratanakiri", label: "Ratanakiri", labelKm: "រតនគិរី" },
  { value: "siem-reap", label: "Siem Reap", labelKm: "សៀមរាប" },
  { value: "stung-treng", label: "Stung Treng", labelKm: "ស្ទឹងត្រែង" },
  { value: "svay-rieng", label: "Svay Rieng", labelKm: "ស្វាយរៀង" },
  { value: "takeo", label: "Takeo", labelKm: "តាកែវ" },
  { value: "tbong-khmum", label: "Tbong Khmum", labelKm: "ត្បូងឃ្មុំ" },
  {
    value: "nationwide",
    label: "Nationwide / online only",
    labelKm: "ទូទាំងប្រទេស / អនឡាញ",
  },
] as const satisfies readonly Labelled[];

// A platform left out of a listing means "unknown". Editors only set
// "not_available" after checking.
export const availabilityOptions = [
  { value: "available", label: "Available", labelKm: "មាន" },
  { value: "not_available", label: "Not available", labelKm: "មិនមាន" },
] as const satisfies readonly Labelled[];

export const platformGroups = [
  { value: "website", label: "Website", labelKm: "គេហទំព័រ" },
  { value: "social", label: "Social media", labelKm: "បណ្ដាញសង្គម" },
  { value: "messaging", label: "Messaging", labelKm: "ផ្ញើសារ" },
  { value: "maps", label: "Maps", labelKm: "ផែនទី" },
  { value: "delivery", label: "Delivery & rides", labelKm: "ដឹកជញ្ជូន" },
  { value: "payment", label: "Payment", labelKm: "ការទូទាត់" },
  { value: "marketplace", label: "Marketplace", labelKm: "ទីផ្សារអនឡាញ" },
  { value: "apps", label: "Mobile apps", labelKm: "កម្មវិធីទូរស័ព្ទ" },
  { value: "jobs", label: "Jobs", labelKm: "ការងារ" },
  { value: "other", label: "Other", labelKm: "ផ្សេងៗ" },
] as const satisfies readonly Labelled[];

export const listingStatuses = [
  { value: "active", label: "Active", labelKm: "សកម្ម" },
  { value: "unverified", label: "Unverified", labelKm: "មិនទាន់ផ្ទៀងផ្ទាត់" },
  { value: "closed", label: "Closed", labelKm: "បិទ" },
] as const satisfies readonly Labelled[];

export type ListingType = (typeof listingTypes)[number]["value"];
export type Province = (typeof provinces)[number]["value"];
export type Availability = (typeof availabilityOptions)[number]["value"];
export type PlatformGroup = (typeof platformGroups)[number]["value"];
export type ListingStatus = (typeof listingStatuses)[number]["value"];

// Keystatic select fields only take { label, value }.
export function toOptions<V extends string>(items: readonly Labelled<V>[]) {
  return items.map(({ value, label }) => ({ value, label }));
}
