export interface AffiliateNetwork {
  id: string;
  name: string;
  baseUrl: string;
  trackingParam: string;
  active: boolean;
}

export const affiliateNetworks: AffiliateNetwork[] = [
  {
    id: "networx",
    name: "Networx",
    baseUrl: "https://www.networx.com",
    trackingParam: "ref",
    active: false,
  },
  {
    id: "profitise",
    name: "Profitise",
    baseUrl: "https://www.profitise.com",
    trackingParam: "ref",
    active: false,
  },
  {
    id: "modernize",
    name: "Modernize",
    baseUrl: "https://www.modernize.com",
    trackingParam: "ref",
    active: false,
  },
  {
    id: "homeadvisor",
    name: "HomeAdvisor",
    baseUrl: "https://www.homeadvisor.com",
    trackingParam: "ref",
    active: false,
  },
  {
    id: "shareasale",
    name: "ShareASale",
    baseUrl: "https://www.shareasale.com",
    trackingParam: "ref",
    active: false,
  },
];

export function getActiveAffiliate(): AffiliateNetwork | undefined {
  return affiliateNetworks.find((n) => n.active);
}
