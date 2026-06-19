import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Database,
  Flame,
  Thermometer,
  Home,
  Calendar,
  Calculator,
  Upload,
  Download,
  Search,
  Filter,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers,
  Star,
  X,
  FileText,
  AlertCircle,
  AlertTriangle,
  Scale,
  Gavel,
  Receipt,
  Landmark,
  UserCircle,
  TrendingUp,
  MapPin,
  DollarSign,
  Info,
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Hash as Slack,
  Settings,
  CheckCheck,
  Eye,
  Camera,
  BookOpen,
  Phone,
  Clock,
  Sparkles,
  Inbox,
  Tag,
} from "lucide-react";

// ----------------------------------------------------------------------------
// MOCK MIAMI-DADE LEAD DATA
// In production, these records come from the ingestion pipeline described in
// the manual. Every field maps to a real Miami-Dade public-records source.
// ----------------------------------------------------------------------------
const seedLeads = [
  {
    id: 1,
    score: 100,
    type: "Pre-Foreclosure",
    docType: "L/P",
    filed: "2026-04-30",
    owner: "RODRIGUEZ MIGUEL A",
    via: "MIDTOWN MIAMI CONDO ASSOC",
    folio: "01-3124-077-0190",
    propertyAddress: "3470 NE 1ST AVE #1208",
    propertyCity: "MIAMI, FL 33137",
    mailingAddress: "3470 NE 1ST AVE #1208",
    mailingCity: "MIAMI, FL 33137-2202",
    amount: 8412,
    flags: ["New this week", "Tax delinquent", "STACKED"],
    equity: "LOW",
    legalDesc: "MIDTOWN MIAMI CONDO UNIT 1208",
    docLink: "https://onlineservices.miamidadeclerk.gov/officialrecords/",
  },
  {
    id: 2,
    score: 100,
    type: "Pre-Foreclosure",
    docType: "L/P",
    filed: "2026-04-29",
    owner: "GHANI MUSAB ABDUL",
    via: "KENDALL LAKES HOA",
    folio: "30-5908-014-0220",
    propertyAddress: "13245 SW 88TH ST",
    propertyCity: "MIAMI, FL 33186",
    mailingAddress: "13245 SW 88TH ST",
    mailingCity: "MIAMI, FL 33186-4112",
    amount: 1221,
    flags: ["Lis pendens", "LLC / corp owner", "New this week", "Tax delinquent", "STACKED"],
    equity: "MEDIUM",
    legalDesc: "KENDALL LAKES SEC 3 PB 102-39 LOT 22 BLK 4",
    docLink: "https://apps.miamidadepa.gov/propertysearch/",
  },
  {
    id: 3,
    score: 100,
    type: "Pre-Foreclosure",
    docType: "L/P",
    filed: "2026-04-22",
    owner: "KELLY LELAND HANNAH",
    via: "LIBERTY CITY HOMEOWNERS",
    folio: "01-3115-018-0490",
    propertyAddress: "1422 NW 62ND ST",
    propertyCity: "MIAMI, FL 33147",
    mailingAddress: "1422 NW 62ND ST",
    mailingCity: "MIAMI, FL 33147-6801",
    amount: 9015,
    flags: ["Lis pendens", "LLC / corp owner", "New this week", "Tax delinquent", "STACKED"],
    equity: "MEDIUM",
    legalDesc: "LIBERTY CITY 1ST ADD PB 8-21 LOT 49",
    docLink: "https://apps.miamidadepa.gov/propertysearch/",
  },
  {
    id: 4,
    score: 95,
    type: "PFC Auction",
    docType: "FCL",
    filed: "2026-04-28",
    owner: "PEREZ ANGELA M",
    via: "WELLS FARGO BANK NA",
    folio: "30-4015-002-1200",
    propertyAddress: "8845 SW 142ND CT",
    propertyCity: "MIAMI, FL 33186",
    mailingAddress: "PO BOX 884401",
    mailingCity: "MIAMI, FL 33188-4401",
    amount: 247000,
    flags: ["PFC Auction", "Absentee owner", "High equity", "STACKED"],
    equity: "HIGH",
    legalDesc: "KENDALE LAKES SEC 1 PB 88-12 LOT 12 BLK 2",
    docLink: "https://www.miamidadeclerk.gov/clerk/foreclosures.page",
  },
  {
    id: 5,
    score: 92,
    type: "Probate",
    docType: "PRB",
    filed: "2026-03-15",
    owner: "ESTATE OF WILLIAMS DOROTHY M",
    via: "MIAMI-DADE PROBATE DIV",
    folio: "01-3219-011-0080",
    propertyAddress: "245 NW 71ST ST",
    propertyCity: "MIAMI, FL 33150",
    mailingAddress: "245 NW 71ST ST",
    mailingCity: "MIAMI, FL 33150-3322",
    amount: 0,
    flags: ["Probate", "Long hold (45y)", "Free & clear", "STACKED"],
    equity: "HIGH",
    legalDesc: "LITTLE RIVER GARDENS PB 3-87 LOT 8 BLK 11",
    docLink: "https://www2.miamidadeclerk.gov/cvweb/",
  },
  {
    id: 6,
    score: 88,
    type: "Tax Default",
    docType: "TAX",
    filed: "2026-04-01",
    owner: "OCEAN VIEW HOLDINGS LLC",
    via: "MIAMI-DADE TAX COLLECTOR",
    folio: "04-3211-006-0560",
    propertyAddress: "510 W 49TH ST",
    propertyCity: "HIALEAH, FL 33012",
    mailingAddress: "2900 NE 188TH ST #110",
    mailingCity: "AVENTURA, FL 33180-2755",
    amount: 18432,
    flags: ["Tax delinquent (3yr)", "LLC / corp owner", "Absentee owner", "STACKED"],
    equity: "MEDIUM",
    legalDesc: "HIALEAH ESTATES LOT 14",
    docLink: "https://www.miamidade.county-taxes.com/",
  },
  {
    id: 7,
    score: 86,
    type: "PFC Auction",
    docType: "FCL",
    filed: "2026-04-25",
    owner: "JEAN-BAPTISTE CARLOS",
    via: "BANK OF AMERICA NA",
    folio: "30-3030-013-1450",
    propertyAddress: "1655 NW 119TH ST",
    propertyCity: "NORTH MIAMI, FL 33167",
    mailingAddress: "1655 NW 119TH ST",
    mailingCity: "NORTH MIAMI, FL 33167-1841",
    amount: 178500,
    flags: ["PFC Auction", "Code violation", "STACKED"],
    equity: "MEDIUM",
    legalDesc: "BISCAYNE GARDENS SEC C PB 51-11 LOT 14 BLK 23",
    docLink: "https://www.miamidadeclerk.gov/clerk/foreclosures.page",
  },
  {
    id: 8,
    score: 84,
    type: "Prop Liens <$50K",
    docType: "LIEN",
    filed: "2026-03-12",
    owner: "GONZALEZ ROBERTO",
    via: "CITY OF MIAMI CODE ENF",
    folio: "01-3128-019-0670",
    propertyAddress: "7320 NW 17TH AVE",
    propertyCity: "MIAMI, FL 33147",
    mailingAddress: "7320 NW 17TH AVE",
    mailingCity: "MIAMI, FL 33147-5510",
    amount: 47800,
    flags: ["Code lien", "Unsafe structure", "Long hold (22y)", "STACKED"],
    equity: "HIGH",
    legalDesc: "ALLAPATTAH 2ND ADD PB 6-44 LOT 67 BLK 19",
    docLink: "https://miami-fl.govqa.us/",
  },
  {
    id: 9,
    score: 82,
    type: "Tax Default",
    docType: "TAX",
    filed: "2026-04-01",
    owner: "MARTINEZ ELENA",
    via: "MIAMI-DADE TAX COLLECTOR",
    folio: "30-4928-014-0030",
    propertyAddress: "11340 SW 184TH ST",
    propertyCity: "MIAMI, FL 33157",
    mailingAddress: "11340 SW 184TH ST",
    mailingCity: "MIAMI, FL 33157-7220",
    amount: 7290,
    flags: ["Tax delinquent (2yr)", "Long hold (18y)"],
    equity: "HIGH",
    legalDesc: "PERRINE PINES PB 78-22 LOT 3 BLK 14",
    docLink: "https://www.miamidade.county-taxes.com/",
  },
  {
    id: 10,
    score: 79,
    type: "Pre-Foreclosure",
    docType: "L/P",
    filed: "2026-04-19",
    owner: "BERNARD HOLDINGS LLC",
    via: "DEUTSCHE BANK TRUST CO",
    folio: "01-4109-002-2340",
    propertyAddress: "488 NE 18TH ST UNIT 905",
    propertyCity: "MIAMI, FL 33132",
    mailingAddress: "9450 SW 24TH ST",
    mailingCity: "MIAMI, FL 33165-2810",
    amount: 312500,
    flags: ["Lis pendens", "LLC / corp owner", "Absentee owner"],
    equity: "MEDIUM",
    legalDesc: "EDGEWATER MIAMI CONDO UNIT 905",
    docLink: "https://onlineservices.miamidadeclerk.gov/officialrecords/",
  },
  {
    id: 11,
    score: 76,
    type: "Probate",
    docType: "PRB",
    filed: "2026-02-28",
    owner: "ESTATE OF SANTOS ROBERTO",
    via: "MIAMI-DADE PROBATE DIV",
    folio: "30-5021-008-0440",
    propertyAddress: "9852 SW 56TH TER",
    propertyCity: "MIAMI, FL 33165",
    mailingAddress: "9852 SW 56TH TER",
    mailingCity: "MIAMI, FL 33165-5810",
    amount: 0,
    flags: ["Probate", "Long hold (38y)"],
    equity: "HIGH",
    legalDesc: "WESTCHESTER PB 64-15 LOT 11 BLK 8",
    docLink: "https://www2.miamidadeclerk.gov/cvweb/",
  },
  {
    id: 12,
    score: 74,
    type: "PFC Auction",
    docType: "FCL",
    filed: "2026-04-15",
    owner: "TORRES ALBERTO",
    via: "JPMORGAN CHASE BANK NA",
    folio: "30-3122-016-0220",
    propertyAddress: "2415 NW 21ST ST",
    propertyCity: "MIAMI, FL 33142",
    mailingAddress: "2415 NW 21ST ST",
    mailingCity: "MIAMI, FL 33142-7741",
    amount: 145000,
    flags: ["PFC Auction", "New this week"],
    equity: "MEDIUM",
    legalDesc: "ALLAPATTAH PB 4-62 LOT 22 BLK 16",
    docLink: "https://www.miamidadeclerk.gov/clerk/foreclosures.page",
  },
  {
    id: 13,
    score: 72,
    type: "Judgment",
    docType: "JDG",
    filed: "2026-03-22",
    owner: "ALVAREZ MARIA T",
    via: "DISCOVER BANK",
    folio: "01-3015-022-1180",
    propertyAddress: "1820 NW 28TH ST",
    propertyCity: "MIAMI, FL 33142",
    mailingAddress: "1820 NW 28TH ST",
    mailingCity: "MIAMI, FL 33142-3340",
    amount: 23440,
    flags: ["Judgment", "Tax delinquent"],
    equity: "MEDIUM",
    legalDesc: "ALLAPATTAH 3RD ADD PB 7-12 LOT 18 BLK 22",
    docLink: "https://www2.miamidadeclerk.gov/cvweb/",
  },
  {
    id: 14,
    score: 68,
    type: "Tax Default",
    docType: "TAX",
    filed: "2026-04-01",
    owner: "WHITESTONE PROPERTIES LLC",
    via: "MIAMI-DADE TAX COLLECTOR",
    folio: "01-2202-008-0090",
    propertyAddress: "3290 SW 22ND ST",
    propertyCity: "MIAMI, FL 33145",
    mailingAddress: "1450 BRICKELL AVE STE 1900",
    mailingCity: "MIAMI, FL 33131-3458",
    amount: 11200,
    flags: ["Tax delinquent", "LLC / corp owner", "Absentee owner"],
    equity: "MEDIUM",
    legalDesc: "SHENANDOAH PARK PB 14-89 LOT 9 BLK 8",
    docLink: "https://www.miamidade.county-taxes.com/",
  },
  {
    id: 15,
    score: 65,
    type: "Prop Liens $100K+",
    docType: "LIEN",
    filed: "2026-03-08",
    owner: "DUVAL FRANCOIS",
    via: "HOMESTEAD CODE ENF",
    folio: "10-3225-014-0510",
    propertyAddress: "740 SW 8TH ST",
    propertyCity: "HOMESTEAD, FL 33030",
    mailingAddress: "740 SW 8TH ST",
    mailingCity: "HOMESTEAD, FL 33030-5510",
    amount: 138400,
    flags: ["Code lien", "Long-running violation", "Daily fines accruing", "STACKED"],
    equity: "MEDIUM",
    legalDesc: "NORMANDY SHORES PB 35-72 LOT 51 BLK 14",
    docLink: "https://www.miamibeachfl.gov/code/",
  },
  {
    id: 16,
    score: 62,
    type: "PFC Auction",
    docType: "FCL",
    filed: "2026-04-10",
    owner: "RIVERA CARLOS",
    via: "FREEDOM MORTGAGE CORP",
    folio: "30-7820-014-0420",
    propertyAddress: "21340 NW 14TH AVE",
    propertyCity: "MIAMI GARDENS, FL 33169",
    mailingAddress: "21340 NW 14TH AVE",
    mailingCity: "MIAMI GARDENS, FL 33169-1180",
    amount: 198000,
    flags: ["PFC Auction"],
    equity: "MEDIUM",
    legalDesc: "MIAMI GARDENS PB 91-22 LOT 42 BLK 14",
    docLink: "https://www.miamidadeclerk.gov/clerk/foreclosures.page",
  },
  {
    id: 17,
    score: 58,
    type: "Tax Default",
    docType: "TAX",
    filed: "2026-04-01",
    owner: "JOHNSON BRENDA",
    via: "MIAMI-DADE TAX COLLECTOR",
    folio: "30-2211-009-0780",
    propertyAddress: "5212 NW 25TH AVE",
    propertyCity: "MIAMI, FL 33142",
    mailingAddress: "5212 NW 25TH AVE",
    mailingCity: "MIAMI, FL 33142-2410",
    amount: 4820,
    flags: ["Tax delinquent"],
    equity: "MEDIUM",
    legalDesc: "BROWNSVILLE PB 22-44 LOT 78 BLK 9",
    docLink: "https://www.miamidade.county-taxes.com/",
  },
  {
    id: 18,
    score: 55,
    type: "Federal Tax Lien",
    docType: "LIEN",
    filed: "2026-03-04",
    owner: "GARCIA RAFAEL",
    via: "INTERNAL REVENUE SERVICE",
    folio: "04-2030-006-1820",
    propertyAddress: "780 W 28TH ST",
    propertyCity: "HIALEAH, FL 33010",
    mailingAddress: "780 W 28TH ST",
    mailingCity: "HIALEAH, FL 33010-1455",
    amount: 47200,
    flags: ["Federal tax lien (NFTL)", "IRS"],
    equity: "MEDIUM",
    legalDesc: "HIALEAH 4TH ADD PB 12-78 LOT 22 BLK 18",
    docLink: "https://www.miamidadeclerk.gov/officialrecords/",
  },
  {
    id: 19,
    score: 52,
    type: "Judgment",
    docType: "JDG",
    filed: "2026-02-18",
    owner: "PATEL DIPAK",
    via: "CAPITAL ONE BANK USA NA",
    folio: "30-5915-022-1340",
    propertyAddress: "13422 SW 96TH ST",
    propertyCity: "MIAMI, FL 33186",
    mailingAddress: "13422 SW 96TH ST",
    mailingCity: "MIAMI, FL 33186-2244",
    amount: 12800,
    flags: ["Judgment"],
    equity: "MEDIUM",
    legalDesc: "KENDALL ESTATES PB 88-39 LOT 14 BLK 22",
    docLink: "https://www2.miamidadeclerk.gov/cvweb/",
  },
  {
    id: 20,
    score: 48,
    type: "Tax Default",
    docType: "TAX",
    filed: "2026-04-01",
    owner: "WILSON DAVID & MARY",
    via: "MIAMI-DADE TAX COLLECTOR",
    folio: "30-4001-008-0240",
    propertyAddress: "8470 SW 142ND AVE",
    propertyCity: "MIAMI, FL 33183",
    mailingAddress: "8470 SW 142ND AVE",
    mailingCity: "MIAMI, FL 33183-4810",
    amount: 3200,
    flags: ["Tax delinquent"],
    equity: "MEDIUM",
    legalDesc: "KENDALL HEIGHTS PB 95-14 LOT 24 BLK 8",
    docLink: "https://www.miamidade.county-taxes.com/",
  },
  {
    id: 21,
    score: 44,
    type: "Other Liens",
    docType: "LIEN",
    filed: "2026-02-22",
    owner: "RAMIREZ JOSE",
    via: "FL DEPT OF REVENUE — CHILD SUPPORT",
    folio: "07-2208-018-0410",
    propertyAddress: "1640 NE 167TH ST",
    propertyCity: "NORTH MIAMI BEACH, FL 33162",
    mailingAddress: "1640 NE 167TH ST",
    mailingCity: "NORTH MIAMI BEACH, FL 33162-3320",
    amount: 12300,
    flags: ["State lien", "Child support"],
    equity: "LOW",
    legalDesc: "EASTERN SHORES PB 41-22 LOT 41 BLK 18",
    docLink: "https://www.miamidadeclerk.gov/officialrecords/",
  },
  {
    id: 22,
    score: 38,
    type: "Judgment",
    docType: "JDG",
    filed: "2026-01-30",
    owner: "BROWN TIFFANY",
    via: "MIDLAND CREDIT MGMT",
    folio: "30-7011-013-0820",
    propertyAddress: "18420 NW 47TH AVE",
    propertyCity: "MIAMI GARDENS, FL 33055",
    mailingAddress: "18420 NW 47TH AVE",
    mailingCity: "MIAMI GARDENS, FL 33055-1140",
    amount: 6200,
    flags: ["Judgment"],
    equity: "LOW",
    legalDesc: "CAROL CITY PB 60-44 LOT 82 BLK 13",
    docLink: "https://www2.miamidadeclerk.gov/cvweb/",
  },
];

// Generate additional realistic records to reach a believable total
function generateExtraLeads(base) {
  const extras = [];
  const types = ["Tax Default", "PFC Auction", "Pre-Foreclosure", "Probate"];
  // Each entry: [city, zip, folio prefix matching the municipality]
  const cities = [
    ["MIAMI", "33125", "01"],
    ["MIAMI", "33142", "01"],
    ["MIAMI", "33147", "01"],
    ["MIAMI", "33150", "01"],
    ["MIAMI", "33177", "30"],
    ["HIALEAH", "33010", "04"],
    ["HIALEAH", "33012", "04"],
    ["MIAMI GARDENS", "33055", "34"],
    ["NORTH MIAMI", "33167", "06"],
    ["HOMESTEAD", "33030", "10"],
    ["OPA-LOCKA", "33054", "08"],
    ["OPA-LOCKA", "33055", "08"],
    ["KENDALL", "33186", "30"],
  ];
  const streets = [
    "NW 7TH AVE", "SW 8TH ST", "BISCAYNE BLVD", "FLAGLER ST", "CORAL WAY",
    "NE 2ND AVE", "SW 27TH AVE", "NW 36TH ST", "BIRD RD", "OKEECHOBEE RD",
    "NW 79TH ST", "PALMETTO EXPY", "SUNSET DR", "KENDALL DR", "DOLPHIN EXPY",
  ];
  let idCounter = base.length + 1;
  for (let i = 0; i < 35; i++) {
    const t = types[i % types.length];
    const [city, zip, prefix] = cities[i % cities.length];
    const street = streets[i % streets.length];
    const num = 100 + Math.floor(Math.random() * 9900);
    const score = Math.max(15, 45 - Math.floor(i / 2));
    extras.push({
      id: idCounter++,
      score,
      type: t,
      docType: t.slice(0, 3).toUpperCase(),
      filed: `2026-0${1 + (i % 4)}-${String(1 + (i % 28)).padStart(2, "0")}`,
      owner: `${["SMITH", "GARCIA", "MARTINEZ", "RODRIGUEZ", "LEE", "HERNANDEZ", "GONZALEZ", "PEREZ"][i % 8]} ${["JOHN", "MARIA", "LUIS", "ANA", "DAVID", "CARMEN"][i % 6]}`,
      via: t === "Tax Default" ? "MIAMI-DADE TAX COLLECTOR" : "VARIOUS PARTIES",
      folio: `${prefix}-${String(2000 + i * 7).padStart(4, "0")}-${String(i % 30).padStart(3, "0")}-${String(i * 11 % 9999).padStart(4, "0")}`,
      propertyAddress: `${num} ${street}`,
      propertyCity: `${city}, FL ${zip}`,
      mailingAddress: (() => {
        // ~75% local, ~10% in-state, ~12% out-of-state, ~3% out-of-country
        if (i % 13 === 0) return `${100 + i * 3} BRICKELL AVE STE ${100 + i}`; // LLC registered agent
        if (i % 17 === 0) return `${200 + i * 7} OCEAN BLVD`; // out of state
        if (i % 29 === 0) return `AV. CORRIENTES ${1500 + i}`; // out of country
        return `${num} ${street}`;
      })(),
      mailingCity: (() => {
        if (i % 13 === 0) return `MIAMI, FL 33131-${String(1000 + i).padStart(4, "0")}`;
        if (i % 11 === 0) return `ORLANDO, FL 32801-${String(1000 + i).padStart(4, "0")}`;
        if (i % 17 === 0) return ["NEW YORK, NY 10022", "LOS ANGELES, CA 90024", "ATLANTA, GA 30309", "BOSTON, MA 02116", "CHICAGO, IL 60601"][i % 5];
        if (i % 29 === 0) return ["BUENOS AIRES, ARGENTINA", "CARACAS, VENEZUELA", "BOGOTA, COLOMBIA"][i % 3];
        return `${city}, FL ${zip}-${String(1000 + i).padStart(4, "0")}`;
      })(),
      amount: 1000 + Math.floor(Math.random() * 50000),
      flags: [
        t === "Tax Default" ? "Tax delinquent" :
        t.toLowerCase(),
      ],
      equity: ["LOW", "MEDIUM", "HIGH"][i % 3],
      legalDesc: `LOT ${i + 1} BLK ${i % 20}`,
      docLink: "https://apps.miamidadepa.gov/propertysearch/",
    });
  }
  return extras;
}

// ----------------------------------------------------------------------------
// MLS STATUS DECORATION
// In production, this comes from the MIAMI MLS RESO Web API joined to leads
// by ParcelNumber (folio). RESO StandardStatus values: Active, ActiveUnderContract,
// Pending, Closed, Canceled, Expired, Withdrawn. We collapse the contract-stage
// values to "Pending" and treat Withdrawn the same as Canceled.
// ----------------------------------------------------------------------------
const MLS_STATUSES = [
  { key: "Active",            color: "#2563eb", scoreAdj: -20, outreachBlocked: true,  label: "Active on MLS" },
  { key: "Pending",           color: "#7c3aed", scoreAdj: -25, outreachBlocked: true,  label: "Pending on MLS" },
  { key: "Came Back",         color: "#f97316", scoreAdj: +20, outreachBlocked: false, label: "Came Back to Market" },
  { key: "Expired",           color: "#dc2626", scoreAdj: +30, outreachBlocked: false, label: "MLS Expired" },
  { key: "Canceled",          color: "#dc2626", scoreAdj: +30, outreachBlocked: false, label: "MLS Canceled / Withdrawn" },
  // Sold is reachable via the MLS importer's Closed/Sold rows. outreachBlocked
  // because a sold property has changed hands. scoreAdj=0 because Sold leads
  // are comp-source / cash-buyer-list data, not motivation leads.
  { key: "Sold",              color: "#16a34a", scoreAdj:   0, outreachBlocked: true,  label: "Sold via MLS" },
  { key: "Off-Market",        color: "#94a3b8", scoreAdj:   0, outreachBlocked: false, label: "Off-Market" },
];
const MLS_STATUS_BY_KEY = Object.fromEntries(MLS_STATUSES.map((s) => [s.key, s]));

function decorateWithMls(lead) {
  // Deterministic per-lead RNG so the same lead always has the same MLS state
  const rand = mulberry32(lead.id * 7919 + 13);
  const roll = rand();
  let mlsStatus = "Off-Market";
  if (roll < 0.12)      mlsStatus = "Active";
  else if (roll < 0.17) mlsStatus = "Pending";
  else if (roll < 0.20) mlsStatus = "Came Back";
  else if (roll < 0.32) mlsStatus = "Expired";
  else if (roll < 0.38) mlsStatus = "Canceled";

  const today = new Date("2026-05-07");
  const daysOnMarket = mlsStatus === "Off-Market" ? null : 5 + Math.floor(rand() * 180);
  const listDate = mlsStatus === "Off-Market" ? null : (() => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysOnMarket);
    return d.toISOString().slice(0, 10);
  })();
  const statusDate = mlsStatus === "Off-Market" ? null : (() => {
    const d = new Date(today);
    // Active/Pending are current; Expired/Canceled/Came Back happened recently
    const daysAgo = (mlsStatus === "Active" || mlsStatus === "Pending")
      ? 0
      : Math.floor(rand() * 60);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  })();
  // List price is roughly 8x to 15x the amount field for non-tax leads, fixed range for tax
  const listPrice = mlsStatus === "Off-Market" ? null
    : Math.round((150000 + rand() * 600000) / 1000) * 1000;
  const agents = ["Maria Gonzalez · Compass", "Carlos Perez · Coldwell Banker", "Jennifer Wu · ONE Sotheby's", "David Martinez · Keller Williams", "Lisa Chen · EWM Realty", "Robert Davis · Douglas Elliman"];
  const listingAgent = mlsStatus === "Off-Market" ? null : agents[Math.floor(rand() * agents.length)];
  const mlsId = mlsStatus === "Off-Market" ? null : `A${10000000 + Math.floor(rand() * 89999999)}`;

  const cfg = MLS_STATUS_BY_KEY[mlsStatus];
  const adjustedScore = Math.max(0, Math.min(100, lead.score + cfg.scoreAdj));

  // Add MLS-derived flags
  const newFlags = [...lead.flags];
  if (mlsStatus === "Expired" || mlsStatus === "Canceled") {
    newFlags.push(`MLS ${mlsStatus}`);
    if (!newFlags.includes("STACKED") && lead.flags.length >= 2) newFlags.push("STACKED");
  }
  if (mlsStatus === "Came Back") newFlags.push("Came back to market");
  if (mlsStatus === "Active") newFlags.push("MLS Active");
  if (mlsStatus === "Pending") newFlags.push("MLS Pending");

  return {
    ...lead,
    score: adjustedScore,
    flags: newFlags,
    mlsStatus,
    mlsListPrice: listPrice,
    mlsDaysOnMarket: daysOnMarket,
    mlsListDate: listDate,
    mlsStatusDate: statusDate,
    mlsListingAgent: listingAgent,
    mlsId,
    outreachBlocked: cfg.outreachBlocked,
  };
}

const allLeadsBase = [...seedLeads, ...generateExtraLeads(seedLeads)].map(decorateWithMls);

// ----------------------------------------------------------------------------
// CLERK DEED FEED
// In production, the daily Clerk Official Records scrape pulls all recorded
// deeds and the doc stamp tax. Florida charges $0.70 per $100 of consideration
// in every county; we reverse the math to infer sale price from stamps.
//
// Deed type → action mapping (per our build plan):
//   Warranty Deed          → real sale, mark SOLD
//   Special Warranty Deed  → real sale, mark SOLD
//   Trustee's Deed / CoT   → foreclosure completion, change owner / REO
//   Tax Deed               → tax deed sale completion, change owner
//   Quit Claim Deed:
//     - if stamps ≥ $10K of consideration → real sale, mark SOLD
//     - else → family/divorce/trust transfer, KEEP lead, rewrite owner
//   Personal Representative's Deed:
//     - if stamps ≥ $10K of consideration → real sale, mark SOLD
//     - else → distribution to heirs, KEEP lead, rewrite owner, reclassify Inherited
// ----------------------------------------------------------------------------
const DEED_TYPES = {
  WD:   { label: "Warranty Deed", color: "#16a34a" },
  SWD:  { label: "Special Warranty Deed", color: "#16a34a" },
  QCD:  { label: "Quit Claim Deed", color: "#0891b2" },
  PRD:  { label: "Personal Rep's Deed", color: "#7c3aed" },
  TD:   { label: "Trustee's Deed / CoT", color: "#dc2626" },
  TXD:  { label: "Tax Deed", color: "#dc2626" },
};

const FL_DOC_STAMP_RATE = 0.70 / 100; // $0.70 per $100 of consideration

function inferSalePriceFromStamps(docStamps) {
  // Reverse: consideration = stamps / 0.0070
  return Math.round(docStamps / FL_DOC_STAMP_RATE);
}

// Detect corporate / LLC / trust entities by name. Used at the deed-application
// stage to identify investor grantees (and to confirm grantors are individuals).
// Defined here in addition to the broader LLC_REGEX further down because hoisting
// rules — applyDeedsToLeads runs before that const is declared.
const ENTITY_NAME_REGEX_DEED = /\b(?:LLC|L\.L\.C\.|CORP|INCORPORATED|INC\.?|LP|L\.P\.|TRUST|HOLDINGS|PARTNERS|LIMITED|COMPANY|CO\.|REIT|FUND|GROUP|ENTERPRISES|INVESTMENTS|PROPERTIES|REALTY)\b/i;

function isEntityName(name) {
  return ENTITY_NAME_REGEX_DEED.test(name || "");
}

// Compare a deed's grantor list against the prior owner field.
// Returns true if the grantors are a strict subset of the prior owners
// (i.e., not all co-owners are selling — partial-interest sale).
function isPartialInterestSale(grantorList, priorOwnerField) {
  if (!priorOwnerField) return false;
  const normalize = (s) => (s || "").toUpperCase().replace(/[^A-Z\s]/g, "").replace(/\s+/g, " ").trim();
  // Split FIRST (preserve separators), then normalize each piece
  const priorTokens = (priorOwnerField || "")
    .split(/\s+(?:&|AND)\s+|;/i)
    .map((t) => normalize(t))
    .filter(Boolean);
  if (priorTokens.length < 2) return false; // can't be partial if there was only one owner
  const grantorTokens = (grantorList || []).map(normalize).filter(Boolean);
  const presentCount = priorTokens.filter((p) =>
    grantorTokens.some((g) => g.includes(p) || p.includes(g))
  ).length;
  return presentCount > 0 && presentCount < priorTokens.length;
}

// The actual Possible PI detection. Called for every WD/SWD deed during application.
//   1. Grantor(s) are individuals  →  none match entity regex
//   2. Grantee is a corporation    →  matches entity regex
//   3. Inferred sale price ≤ $100K
//   4. Prior owner had multiple co-owners AND grantors are a subset of them
function detectPossibleRf({ deedType, grantorList, grantee, inferredSalePrice, priorOwnerField }) {
  if (deedType !== "WD" && deedType !== "SWD") return false;
  if (inferredSalePrice == null || inferredSalePrice > 100000) return false;
  if (!isEntityName(grantee)) return false;
  if ((grantorList || []).some((g) => isEntityName(g))) return false; // any grantor is an entity → not RF pattern
  if (!isPartialInterestSale(grantorList, priorOwnerField)) return false;
  return true;
}

// Generate mock deed events. Each event affects 0-1 existing leads (by folio).
// Distribution is realistic: most deeds are WDs to third parties (real sales),
// a meaningful minority are PRDs/QCDs at low/no consideration (heir transfers).
function seedDeeds(leads) {
  const today = new Date("2026-05-07");
  const deeds = [];
  let id = 1;

  // Pick ~15 leads to receive deed events. Bias toward Probate leads getting
  // PR's Deeds, Foreclosure leads getting Trustee's Deeds, others getting WDs.
  const eligible = [...leads].sort((a, b) => (a.id * 13) % 100 - (b.id * 13) % 100).slice(0, 15);

  eligible.forEach((lead) => {
    const rand = mulberry32(lead.id * 1009 + 7);
    const daysAgo = Math.floor(rand() * 60) + 1;
    const recordedDate = new Date(today);
    recordedDate.setDate(recordedDate.getDate() - daysAgo);

    let deedType, grantee, action, salePrice, docStamps;

    if (hasListType(lead, "Probate")) {
      // 60% PR Deed of Distribution to heirs (no consideration), 40% PR sale to 3rd party
      const isHeirDistribution = rand() < 0.6;
      deedType = "PRD";
      if (isHeirDistribution) {
        const heirCount = 1 + Math.floor(rand() * 3); // 1-3 heirs
        const heirs = ["MARTINEZ ELENA", "MARTINEZ DAVID J", "MARTINEZ SOFIA L"].slice(0, heirCount);
        grantee = heirs.join("; ");
        action = "inherited";
        salePrice = 0;
        docStamps = 0.70;
      } else {
        grantee = ["GOLDEN HORIZON LLC", "OAKWOOD INVESTMENTS LLC", "BAYSHORE HOLDINGS LP"][Math.floor(rand() * 3)];
        action = "sold";
        salePrice = Math.round((150000 + rand() * 500000) / 1000) * 1000;
        docStamps = Math.round(salePrice * FL_DOC_STAMP_RATE * 100) / 100;
      }
    } else if (hasListType(lead, "PFC Auction")) {
      // Trustee's Deed / Certificate of Title from foreclosure auction
      deedType = "TD";
      grantee = ["DEUTSCHE BANK NATIONAL TRUST", "U.S. BANK NA AS TRUSTEE", "FANNIE MAE"][Math.floor(rand() * 3)];
      action = "sold";
      salePrice = lead.amount > 0 ? Math.round(lead.amount * (0.95 + rand() * 0.15)) : 200000;
      docStamps = Math.round(salePrice * FL_DOC_STAMP_RATE * 100) / 100;
    } else if ((hasListType(lead, "Tax Default") || hasListType(lead, "Tax Deed")) && rand() < 0.3) {
      // 30% chance the tax-delinquent property went to tax deed sale
      deedType = "TXD";
      grantee = ["BLUE WAVE PROPERTIES LLC", "HORIZON CAPITAL LLC", "SUNSHINE LAND TRUST"][Math.floor(rand() * 3)];
      action = "sold";
      salePrice = Math.round((40000 + rand() * 200000) / 1000) * 1000;
      docStamps = Math.round(salePrice * FL_DOC_STAMP_RATE * 100) / 100;
    } else if (rand() < 0.15) {
      // 15% chance: Quit Claim Deed at low/no consideration (family transfer)
      deedType = "QCD";
      grantee = lead.owner.split(" ")[0] + " " + ["JR", "II", "TRUSTEE"][Math.floor(rand() * 3)];
      action = "owner_change";
      salePrice = 0;
      docStamps = 0.70;
    } else {
      // Default branch: Warranty Deed. Could be a real arms-length sale OR a
      // Possible PI (partition fund / partial-interest investor purchase).
      deedType = "WD";
      const isPossibleRf = rand() < 0.25 && /\s&\s|\sAND\s/i.test(lead.owner); // need multi-owner field to be partial
      if (isPossibleRf) {
        // Partition / RF investor names — these are real-pattern operator entities
        grantee = ["PARTITION FUND I LLC", "EQUITY RECOVERY PARTNERS LLC", "TENANCY HOLDINGS LP", "FRACTIONAL TITLE LLC", "CO-TENANT CAPITAL LLC"][Math.floor(rand() * 5)];
        action = "sold"; // gets reclassified to "possible_rf" by applyDeedsToLeads when detection fires
        // Low price: fractional interest typically sold $20K–$95K
        salePrice = Math.round((20000 + rand() * 75000) / 1000) * 1000;
        docStamps = Math.round(salePrice * FL_DOC_STAMP_RATE * 100) / 100;
      } else {
        grantee = ["MIAMI INVESTMENT PARTNERS LLC", "BISCAYNE EQUITIES LLC", "SUNSET REALTY GROUP LLC"][Math.floor(rand() * 3)];
        action = "sold";
        salePrice = Math.round((200000 + rand() * 600000) / 1000) * 1000;
        docStamps = Math.round(salePrice * FL_DOC_STAMP_RATE * 100) / 100;
      }
    }

    // For Possible PI deeds, construct a grantor list that's a strict subset of
    // the prior co-owners (this is what makes it a partial-interest sale)
    let grantorList;
    if (deedType === "WD" && grantee && /\b(?:PARTITION|EQUITY RECOVERY|TENANCY|FRACTIONAL|CO-TENANT)\b/i.test(grantee)) {
      // Pick first listed co-owner as the lone grantor
      const priorOwners = (lead.owner || "").split(/\s+(?:&|AND)\s+/i);
      grantorList = priorOwners.length > 1 ? [priorOwners[0].trim()] : [lead.owner];
    } else {
      // Normal sales / heir transfers: full owner list
      grantorList = (lead.owner || "").split(/\s+(?:&|AND)\s+/i).map((s) => s.trim());
    }

    deeds.push({
      id: id++,
      cfn: `${recordedDate.getFullYear()}R${String(100000 + Math.floor(rand() * 800000)).padStart(7, "0")}`,
      leadId: lead.id,
      folio: lead.folio,
      deedType,
      grantor: lead.owner,
      grantorList,
      grantee,
      recordedDate: recordedDate.toISOString().slice(0, 10),
      docStamps,
      inferredSalePrice: salePrice,
      action,
    });
  });

  return deeds.sort((a, b) => b.recordedDate.localeCompare(a.recordedDate));
}

const seedDeedsBase = seedDeeds(allLeadsBase);

// Apply deed events to leads: leads with `sold` action get a `soldAt` field and
// drop out of active queues; leads with `owner_change` keep going with the new
// owner; leads with `inherited` get reclassified and scored.
function applyDeedsToLeads(leads, deeds) {
  const deedByLeadId = Object.fromEntries(deeds.map((d) => [d.leadId, d]));
  return leads.map((lead) => {
    const deed = deedByLeadId[lead.id];
    if (!deed) return lead;

    if (deed.action === "sold") {
      // Possible PI check: WD/SWD with individual grantors → corporate grantee
      // at ≤$100K and the grantor list is a subset of prior co-owners.
      // When detected, the lead is NOT closed — it stays active with elevated score.
      const isPossibleRf = detectPossibleRf({
        deedType: deed.deedType,
        grantorList: deed.grantorList,
        grantee: deed.grantee,
        inferredSalePrice: deed.inferredSalePrice,
        priorOwnerField: lead.owner,
      });

      if (isPossibleRf) {
        const newFlags = [...lead.flags];
        if (!newFlags.includes("Possible Partial Interest")) newFlags.push("Possible Partial Interest");
        if (!newFlags.includes("STACKED") && newFlags.length >= 3) newFlags.push("STACKED");
        // Identify the remaining co-owners (those NOT in the grantor list)
        const allPriorOwners = (lead.owner || "").split(/\s+(?:&|AND)\s+/i).map((s) => s.trim());
        const soldGrantors = (deed.grantorList || []).map((s) => s.trim());
        const remainingCoOwners = allPriorOwners.filter((o) =>
          !soldGrantors.some((g) => g.toUpperCase().includes(o.toUpperCase()) || o.toUpperCase().includes(g.toUpperCase()))
        );
        return {
          ...lead,
          // KEY: do NOT set soldAt — lead stays active and exportable
          score: Math.min(100, lead.score + 25),
          flags: newFlags,
          possiblePi: {
            soldDate: deed.recordedDate,
            soldPrice: deed.inferredSalePrice,
            cfn: deed.cfn,
            soldGrantors,
            buyerEntity: deed.grantee,
            remainingCoOwners,
            allPriorOwners,
          },
        };
      }

      return {
        ...lead,
        soldAt: deed.recordedDate,
        soldPrice: deed.inferredSalePrice,
        soldDeedType: deed.deedType,
        newOwner: deed.grantee,
      };
    }

    if (deed.action === "inherited") {
      // Heirs become the new owner, lead reclassifies to one of the Inherited variants
      // based on the actual deed instrument. PRD = Personal Representative Deed
      // (probate-administered); QCD = Quit Claim Deed from heirs (quicker, less formal).
      const heirs = deed.grantee.split(";").map((s) => s.trim());
      const isAbsentee = true; // heirs almost never live in the property
      const newFlags = lead.flags.filter((f) => !["Probate"].includes(f));
      newFlags.push("Inherited");
      if (isAbsentee && !newFlags.includes("Absentee owner")) newFlags.push("Absentee owner");
      if (!newFlags.includes("STACKED") && newFlags.length >= 3) newFlags.push("STACKED");
      // +30 for Inherited base, +10 for Absentee stack
      const adjustedScore = Math.min(100, lead.score + 30 + (isAbsentee ? 10 : 0));
      const inheritedType = deed.deedType === "QCD" ? "Inherited QCD" : "Inherited Probate";
      return {
        ...lead,
        type: inheritedType,
        owner: heirs[0],
        ownerHeirs: heirs,
        score: adjustedScore,
        flags: newFlags,
        inheritedFrom: lead.owner,
        inheritedAt: deed.recordedDate,
        // Heirs typically have a different mailing address than the property
        mailingAddress: lead.mailingAddress, // unknown until skip trace; keep prior for now
      };
    }

    if (deed.action === "owner_change") {
      // QCD at low/no consideration — owner field updates, lead stays active
      return {
        ...lead,
        owner: deed.grantee,
        previousOwner: lead.owner,
        ownerChangedAt: deed.recordedDate,
      };
    }

    return lead;
  });
}

const allLeadsFinal = applyDeedsToLeads(allLeadsBase, seedDeedsBase);

// ----------------------------------------------------------------------------
// EST OF DETECTION
// Two distinct tags:
//   "EST OF"          — owner field on PA roll literally indicates an estate.
//                       Permissive regex covers Florida variants: "EST OF X",
//                       "X EST OF", "ESTATE OF X", "X DECD", "X DECEASED",
//                       and "X (DECD)". Captures c/o personal reps separately.
//   "Possible EST OF" — owner held the property ≥25 years OR sale date is
//                       unknown / null / pre-PA-digitization. Inferential
//                       motivation signal — owner statistically more likely
//                       to be deceased or near end of life.
//   "EST OF 2nd Owner" — multi-owner field where ONE owner has estate marker
//                       and the co-owner does not. The living co-owner is the
//                       contact target; often a surviving spouse.
//   "LE / REM"        — owner field contains LE (life estate) or REM
//                       (remainderman) suffixes. Florida Lady Bird Deed
//                       structure. Sale typically requires both to sign.
// ----------------------------------------------------------------------------
const ESTATE_REGEX = /\b(?:EST(?:ATE)?\s*OF|EST\.?\s*OF|EST\b|ESTATE\b|DEC(?:EASED|D|'D)|\(DECD\))\b/i;
const CO_REGEX = /\bC\/O\s+([A-Z][A-Z\s\.\-']+?)(?:$|\s{2,}|,)/i;
const LE_REGEX = /\b(?:LE|L\/E|\(LE\)|LIFE\s*ESTATE)\b/i;
const REM_REGEX = /\b(?:REM(?:AINDERMAN)?|\(REM\))\b/i;
const ESTATE_HOLD_THRESHOLD_YEARS = 25;

// Split a multi-owner string into individual names. PA roll uses inconsistent
// separators: " & ", " AND ", "; ", and sometimes line breaks. Strip the
// LE/REM/EST OF markers from each name so we can analyze them per-owner.
function splitOwners(ownerField) {
  if (!ownerField) return [];
  // Don't split on AND inside "C/O" personal-rep clauses
  const protectedField = ownerField.replace(/C\/O\s+([^,;]+)/gi, (m) => m.replace(/\s+&\s+|\s+AND\s+/gi, "_AMP_"));
  const parts = protectedField.split(/\s*(?:&|;|\sAND\s)\s*/i);
  return parts.map((p) => p.replace(/_AMP_/g, " & ").trim()).filter(Boolean);
}

function detectEstateStatus(ownerName, lastSaleDate) {
  const ownerStr = ownerName || "";

  // Detect LE/REM first (more specific than plain estate; takes precedence)
  const owners = splitOwners(ownerStr);
  const ownerAnalysis = owners.map((o) => ({
    raw: o,
    isEstate: ESTATE_REGEX.test(o),
    isLE: LE_REGEX.test(o),
    isREM: REM_REGEX.test(o),
    cleanName: o.replace(ESTATE_REGEX, "").replace(LE_REGEX, "").replace(REM_REGEX, "").replace(/\(\s*\)/g, "").trim(),
  }));

  const hasLE = ownerAnalysis.some((o) => o.isLE);
  const hasREM = ownerAnalysis.some((o) => o.isREM);
  const estateOwners = ownerAnalysis.filter((o) => o.isEstate);
  const livingOwners = ownerAnalysis.filter((o) => !o.isEstate && !o.isLE);

  // 1. LE / REM — Lady Bird Deed structure (highest specificity)
  if (hasLE || hasREM) {
    const leOwner = ownerAnalysis.find((o) => o.isLE);
    const remOwners = ownerAnalysis.filter((o) => o.isREM);
    return {
      tag: "LE / REM",
      lifeEstateHolder: leOwner ? leOwner.cleanName : null,
      remaindermen: remOwners.map((o) => o.cleanName),
      reason: hasLE && hasREM
        ? "Lady Bird Deed: life estate holder + remainderman both on title. Sale requires both to sign."
        : hasLE
          ? "Life estate (LE) on title. LE controls property until death; remainderman not yet listed."
          : "Remainderman (REM) on title. Life estate may have ended; check for LE deceased.",
    };
  }

  // 2. EST OF 2nd Owner — multi-owner with one estate marker and a living co-owner
  if (owners.length >= 2 && estateOwners.length >= 1 && livingOwners.length >= 1) {
    return {
      tag: "EST OF 2nd Owner",
      deceasedOwner: estateOwners[0].cleanName,
      livingCoOwner: livingOwners[0].cleanName,
      reason: "Co-owner deceased; surviving co-owner is on title. Often a surviving spouse — contact the living owner directly.",
    };
  }

  // 3. EST OF — single (or all) owners marked as estate
  if (estateOwners.length > 0) {
    const coMatch = ownerStr.match(CO_REGEX);
    return {
      tag: "EST OF",
      personalRepresentative: coMatch ? coMatch[1].trim() : null,
      reason: "Owner name on PA roll explicitly indicates estate",
    };
  }

  // 4. Possible EST OF — long hold or unknown sale date
  if (!lastSaleDate || lastSaleDate === "Unknown" || lastSaleDate === "") {
    return {
      tag: "Possible EST OF",
      reason: "Sale date unknown on PA roll (likely pre-digitization or never recorded with consideration)",
    };
  }
  const saleYear = parseInt(String(lastSaleDate).slice(0, 4), 10);
  if (!isNaN(saleYear)) {
    const today = new Date("2026-05-07");
    const yearsHeld = today.getFullYear() - saleYear;
    if (yearsHeld >= ESTATE_HOLD_THRESHOLD_YEARS) {
      return {
        tag: "Possible EST OF",
        reason: `Owner held property ${yearsHeld} years (≥${ESTATE_HOLD_THRESHOLD_YEARS}-year threshold)`,
        yearsHeld,
      };
    }
  }
  return null;
}

function applyEstateTags(leads) {
  return leads.map((lead) => {
    // Skip leads that are already sold (deed event closed them out) or already
    // reclassified as Inherited (the heir distribution supersedes any estate inference)
    if (lead.soldAt || hasListType(lead, "Inherited Probate") || hasListType(lead, "Inherited QCD")) return lead;

    // Synthesize a deterministic last-sale-date if the lead doesn't have one yet.
    // In production this comes from the PA bulk data join. Mock distribution:
    //   ~7% confirmed EST OF (single owner with estate marker)
    //   ~5% EST OF 2nd Owner (co-owner field with one estate, one living)
    //   ~4% LE / REM (Lady Bird Deed structure)
    //   ~10% unknown sale date (pre-digitization)
    //   ~22% long-hold (25+ years ago)
    //   rest normal sale in last 25 years
    const rand = mulberry32(lead.id * 2741 + 5);
    const saleRoll = rand();
    let lastSaleDate;
    let displayOwner = lead.owner;
    const baseName = lead.owner.replace(/^EST(ATE)?\s*OF\s*|\s*(EST OF|DECD|DECEASED)$/gi, "").trim();
    const spouseFirstNames = ["MARGARET", "ROBERT", "PATRICIA", "WILLIAM", "BARBARA", "RICHARD", "DOROTHY", "JOSEPH"];
    const remNames = ["DAVID J", "SUSAN M", "MICHAEL P", "LAURA T", "BRIAN K"];

    if (saleRoll < 0.07) {
      // Confirmed EST OF — single owner
      const variants = [
        (n) => `EST OF ${n}`,
        (n) => `${n} EST OF`,
        (n) => `ESTATE OF ${n}`,
        (n) => `${n} DECD`,
        (n) => `EST OF ${n} C/O ${["JANE DOE", "ROBERT SMITH", "MARIA LOPEZ", "JAMES WILLIAMS"][Math.floor(rand() * 4)]}`,
      ];
      const variantFn = variants[Math.floor(rand() * variants.length)];
      displayOwner = variantFn(baseName);
      const yrsAgo = 5 + Math.floor(rand() * 35);
      lastSaleDate = `${2026 - yrsAgo}-${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}-15`;
    } else if (saleRoll < 0.12) {
      // EST OF 2nd Owner — co-owner field with one deceased, one living.
      // Most common shape: surviving spouse pattern.
      const lastName = baseName.split(" ")[0];
      const deceasedFirst = baseName.split(" ").slice(1).join(" ") || "JOHN";
      const survivingFirst = spouseFirstNames[Math.floor(rand() * spouseFirstNames.length)];
      const variants = [
        () => `${lastName} ${deceasedFirst} EST OF & ${lastName} ${survivingFirst}`,
        () => `${lastName} ${deceasedFirst} (DECD) AND ${lastName} ${survivingFirst}`,
        () => `EST OF ${lastName} ${deceasedFirst} & ${lastName} ${survivingFirst}`,
      ];
      displayOwner = variants[Math.floor(rand() * variants.length)]();
      const yrsAgo = 10 + Math.floor(rand() * 30);
      lastSaleDate = `${2026 - yrsAgo}-${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}-15`;
    } else if (saleRoll < 0.16) {
      // LE / REM — Lady Bird Deed
      const lastName = baseName.split(" ")[0];
      const leFirst = baseName.split(" ").slice(1).join(" ") || "JOHN";
      const remCount = 1 + Math.floor(rand() * 2); // 1-2 remaindermen
      const remList = remNames.slice(0, remCount).map((rn) => `${lastName} ${rn} REM`).join(" & ");
      const variants = [
        () => `${lastName} ${leFirst} LE & ${remList}`,
        () => `${lastName} ${leFirst} (LE) & ${remList}`,
        () => `${lastName} ${leFirst} L/E & ${remList}`,
      ];
      displayOwner = variants[Math.floor(rand() * variants.length)]();
      const yrsAgo = 5 + Math.floor(rand() * 25);
      lastSaleDate = `${2026 - yrsAgo}-${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}-15`;
    } else if (saleRoll < 0.26) {
      // Unknown sale date
      lastSaleDate = null;
    } else if (saleRoll < 0.48) {
      // Long-hold (25-50 years ago)
      const yrsAgo = 25 + Math.floor(rand() * 25);
      lastSaleDate = `${2026 - yrsAgo}-${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}-15`;
    } else {
      // Normal sale (1-24 years ago)
      const yrsAgo = 1 + Math.floor(rand() * 24);
      lastSaleDate = `${2026 - yrsAgo}-${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}-15`;
    }

    const estate = detectEstateStatus(displayOwner, lastSaleDate);
    if (!estate) {
      return { ...lead, owner: displayOwner, lastSaleDate };
    }

    // Score boost varies by tag specificity
    const scoreBoost = (
      estate.tag === "EST OF" ? 30 :
      estate.tag === "EST OF 2nd Owner" ? 25 :
      estate.tag === "LE / REM" ? 20 :
      15 // Possible EST OF
    );
    const newFlags = [...lead.flags];
    if (!newFlags.includes(estate.tag)) newFlags.push(estate.tag);
    if (!newFlags.includes("STACKED") && newFlags.length >= 3) newFlags.push("STACKED");
    const adjustedScore = Math.min(100, lead.score + scoreBoost);

    return {
      ...lead,
      owner: displayOwner,
      lastSaleDate,
      score: adjustedScore,
      flags: newFlags,
      estateTag: estate.tag,
      estateReason: estate.reason,
      estatePersonalRepresentative: estate.personalRepresentative,
      estateYearsHeld: estate.yearsHeld,
      estateDeceasedOwner: estate.deceasedOwner,
      estateLivingCoOwner: estate.livingCoOwner,
      estateLifeEstateHolder: estate.lifeEstateHolder,
      estateRemaindermen: estate.remaindermen,
    };
  });
}

const allLeadsTagged = applyEstateTags(allLeadsFinal);

// ----------------------------------------------------------------------------
// PA EXEMPTION + LEGAL1 TAGS
// Senior, Widow/Widower, and Adverse Possession come from different PA roll
// fields than the estate detection above:
//
//   Senior          — Florida statute 196.075. Owner 65+ with income limits;
//                     confirmed by the county. Stored on PA record as exemption code.
//   Widow/Widower   — Florida statute 196.202. Surviving spouse exemption;
//                     confirmed by the county. Stored as exemption code.
//   Adverse Possession — text marker in Legal1 description field, e.g. "ADV POSS"
//                     or "ADVERSE POSSESSION CLAIM" or "§95.18 CLAIM". Indicates
//                     a contested-title situation that needs attorney review.
//
// In production the ingestion pulls the exemption codes from PA bulk data
// columns (e.g., HX1, HX2, EXEMPT_SENIOR, EXEMPT_WIDOW). The Legal1 string
// is also already in the bulk data — just regex it.
// ----------------------------------------------------------------------------
const ADVERSE_POSSESSION_REGEX = /\b(?:ADV(?:ERSE)?\s*POSS(?:ESSION)?|95\.18|ADV\s*POSS\s*CLAIM)\b/i;

function detectPaTags(lead, paExemptionsRaw, legal1Text) {
  const tags = [];
  const exemptions = paExemptionsRaw || [];
  if (exemptions.includes("SENIOR") || exemptions.includes("196.075")) {
    tags.push({
      key: "Senior",
      reason: "Florida Senior Exemption (§196.075) on file — owner is 65+",
      scoreBoost: 10,
    });
  }
  if (exemptions.includes("WIDOW") || exemptions.includes("196.202")) {
    tags.push({
      key: "Widow/Widower",
      reason: "Florida Widow's/Widower's Exemption (§196.202) on file — owner's spouse is deceased",
      scoreBoost: 20,
    });
  }
  // Homestead Penalty — Florida PAs file these when an owner improperly maintained
  // homestead exemption (e.g., moved out but kept claiming it, rented out the property,
  // claimed exemption on multiple properties). The penalty is the recovered tax savings
  // plus a 50% penalty plus 15% annual interest — recorded as a lien against the property.
  // Strong forced-sale signal: owner is now paying back-taxes-with-interest on a property
  // they probably can't afford to keep, often after a life event (divorce, downsizing,
  // moving for work).
  if (exemptions.includes("HOMESTEAD_PENALTY") || exemptions.includes("196.161")) {
    tags.push({
      key: "Homestead Penalty",
      reason: "Florida Homestead Penalty Lien (§196.161) on file — owner improperly maintained homestead exemption, now owes back taxes + 50% penalty + 15% interest as a recorded lien",
      scoreBoost: 20,
    });
  }
  // Note: Adverse Possession used to be a PA Tag — now it's a top-level Lead Type
  // because the dashboard treats it as its own pursuit category, not just an exemption.
  return tags;
}

function applyPaTags(leads) {
  return leads.map((lead) => {
    if (lead.soldAt) return lead;

    // Synthesize PA exemption + legal1 fields deterministically.
    // In production these come from the PA bulk feed.
    // Distribution:
    //   ~12% Senior exemption (60% of these are also long-hold owners)
    //   ~6% Widow/Widower exemption
    //   ~2% Homestead Penalty lien
    //   ~3% Adverse Possession marker in legal1 → reclassifies the lead to "Adverse Possession" type
    const rand = mulberry32(lead.id * 4111 + 19);
    const exemptions = [];
    let legal1Override = null;
    let reclassifyToAdversePossession = false;

    // Senior — more common, biased toward long-hold owners
    const seniorBoost = lead.estateYearsHeld && lead.estateYearsHeld >= 25 ? 0.30 : 0.10;
    if (rand() < seniorBoost) exemptions.push("SENIOR");

    // Widow/Widower — independent, but more common when EST OF 2nd Owner is set
    const widowBoost = lead.estateTag === "EST OF 2nd Owner" ? 0.45 : 0.05;
    if (rand() < widowBoost) exemptions.push("WIDOW");

    // Homestead Penalty — uncommon, slight bias toward absentee owners (the type
    // who'd improperly maintain homestead while not occupying the property)
    if (rand() < 0.025) exemptions.push("HOMESTEAD_PENALTY");

    // Adverse Possession in legal1 — reclassify the lead's TYPE rather than tag it
    if (rand() < 0.04) {
      legal1Override = `${lead.legalDesc} ADV POSS CLAIM PER §95.18`;
      reclassifyToAdversePossession = true;
    }

    const detected = detectPaTags(lead, exemptions, legal1Override || lead.legalDesc);
    if (!reclassifyToAdversePossession && detected.length === 0 && exemptions.length === 0 && !legal1Override) return lead;

    const newFlags = [...lead.flags];
    let scoreAdj = 0;
    detected.forEach((t) => {
      if (!newFlags.includes(t.key)) newFlags.push(t.key);
      scoreAdj += t.scoreBoost;
    });
    // Adverse Possession base boost when the lead reclassifies
    if (reclassifyToAdversePossession) {
      scoreAdj += 25;
      if (!newFlags.includes("Adverse Possession")) newFlags.push("Adverse Possession");
    }
    if (!newFlags.includes("STACKED") && newFlags.length >= 3) newFlags.push("STACKED");

    const newListTypes = reclassifyToAdversePossession && !hasListType(lead, "Adverse Possession")
      ? [...(lead.listTypes || []), { name: "Adverse Possession", source: "pa-roll-95.18-regex", verifiedAt: new Date().toISOString() }]
      : lead.listTypes;
    return {
      ...lead,
      type: reclassifyToAdversePossession ? "Adverse Possession" : lead.type,
      listTypes: newListTypes,
      legalDesc: legal1Override || lead.legalDesc,
      paExemptions: exemptions,
      paTags: detected.map((t) => t.key),
      paTagReasons: Object.fromEntries(detected.map((t) => [t.key, t.reason])),
      score: Math.min(100, lead.score + scoreAdj),
      flags: newFlags,
    };
  });
}

const allLeadsFullyTagged = applyPaTags(allLeadsTagged);

// ----------------------------------------------------------------------------
// ABSENTEE OWNER DETECTION
// Compare normalized property address vs mailing address. Sub-tier by distance:
//   In County     — mailing in Miami-Dade but different street than property
//   In State      — mailing elsewhere in Florida
//   Out of State  — mailing in another US state (textbook target)
//   Out of Country — mailing outside the US
// LLC/corp owners are tagged separately because their mailing address is often
// a registered agent, not the beneficial owner — useful but requires more
// skip-tracing to actually reach a human.
// ----------------------------------------------------------------------------
const FL_STATE_REGEX = /\b(?:FL|FLORIDA)\b/i;
const MIAMI_DADE_CITIES = [
  "MIAMI", "MIAMI BEACH", "MIAMI GARDENS", "MIAMI LAKES", "MIAMI SHORES", "MIAMI SPRINGS",
  "HIALEAH", "HIALEAH GARDENS", "CORAL GABLES", "DORAL", "HOMESTEAD", "AVENTURA",
  "NORTH MIAMI", "NORTH MIAMI BEACH", "OPA-LOCKA", "OPA LOCKA", "SOUTH MIAMI",
  "SUNNY ISLES BEACH", "PINECREST", "PALMETTO BAY", "CUTLER BAY", "KENDALL",
  "BAL HARBOUR", "BAY HARBOR ISLANDS", "SURFSIDE", "WEST MIAMI", "FLORIDA CITY",
  "BISCAYNE PARK", "EL PORTAL", "GOLDEN BEACH", "INDIAN CREEK", "MEDLEY",
  "NORTH BAY VILLAGE", "KEY BISCAYNE", "SWEETWATER", "VIRGINIA GARDENS",
];
const LLC_REGEX = /\b(?:LLC|L\.L\.C\.|CORP|INC|LP|L\.P\.|TRUST|HOLDINGS|PARTNERS|LIMITED|COMPANY|CO\.)\b/i;

function normalizeCityState(cityFieldRaw) {
  if (!cityFieldRaw) return { city: "", state: "", country: "US" };
  const s = cityFieldRaw.toUpperCase().trim();
  // Country detection — anything not ending in a US state code defaults to looking foreign
  if (/\b(?:CANADA|MEXICO|UK|UNITED KINGDOM|VENEZUELA|COLOMBIA|ARGENTINA|BRAZIL|SPAIN|ITALY|GERMANY|FRANCE)\b/i.test(s)) {
    return { city: s, state: null, country: "OTHER" };
  }
  // Try to pull state code (e.g., "MIAMI, FL 33125" or "NEW YORK NY 10001")
  const stMatch = s.match(/\b([A-Z]{2})\b\s*\d{5}/);
  const state = stMatch ? stMatch[1] : null;
  const cityPart = s.replace(/,?\s*[A-Z]{2}\s*\d{5}.*$/, "").replace(/^\s*,/, "").trim();
  return { city: cityPart, state, country: "US" };
}

function detectAbsentee(lead) {
  if (!lead.propertyCity || !lead.mailingCity) return null;
  if (!lead.mailingAddress) return null;

  // Normalize both addresses
  const propStreet = (lead.propertyAddress || "").trim().toUpperCase();
  const mailStreet = (lead.mailingAddress || "").trim().toUpperCase();
  const prop = normalizeCityState(lead.propertyCity);
  const mail = normalizeCityState(lead.mailingCity);

  // Same street + same city → owner-occupant, no tag
  if (propStreet === mailStreet && prop.city === mail.city) return null;

  const isLlcOrCorp = LLC_REGEX.test(lead.owner || "");

  // Out of country
  if (mail.country === "OTHER") {
    return {
      tier: "Out of Country",
      scoreBoost: 25,
      isLlcOrCorp,
      mailingLocation: lead.mailingCity,
    };
  }

  // Out of state — Florida property, mailing outside FL
  if (mail.state && mail.state !== "FL") {
    return {
      tier: "Out of State",
      scoreBoost: 20,
      isLlcOrCorp,
      mailingState: mail.state,
      mailingLocation: lead.mailingCity,
    };
  }

  // In state, but not in Miami-Dade
  const mailIsMiamiDade = MIAMI_DADE_CITIES.some((c) => mail.city.startsWith(c));
  if (mail.state === "FL" && !mailIsMiamiDade) {
    return {
      tier: "In State",
      scoreBoost: 10,
      isLlcOrCorp,
      mailingLocation: lead.mailingCity,
    };
  }

  // In county — same county but different street/property
  if (mailIsMiamiDade && (propStreet !== mailStreet || prop.city !== mail.city)) {
    return {
      tier: "In County",
      scoreBoost: 5,
      isLlcOrCorp,
      mailingLocation: lead.mailingCity,
    };
  }

  return null;
}

function applyAbsenteeTags(leads) {
  return leads.map((lead) => {
    if (lead.soldAt) return lead;

    const absentee = detectAbsentee(lead);
    if (!absentee) {
      // Owner-occupant: strip any stale "Absentee owner" flag from seed data
      const cleaned = lead.flags.filter((f) => f !== "Absentee owner");
      return { ...lead, flags: cleaned };
    }

    // Build new flag list — replace any generic "Absentee owner" with the tiered tag
    const newFlags = lead.flags.filter((f) => f !== "Absentee owner");
    const tagKey = `Absentee — ${absentee.tier}`;
    if (!newFlags.includes(tagKey)) newFlags.push(tagKey);
    if (!newFlags.includes("STACKED") && newFlags.length >= 3) newFlags.push("STACKED");

    return {
      ...lead,
      flags: newFlags,
      score: Math.min(100, lead.score + absentee.scoreBoost),
      absenteeTier: absentee.tier,
      absenteeMailingLocation: absentee.mailingLocation,
      absenteeIsLlc: absentee.isLlcOrCorp,
    };
  });
}

const allLeadsFinalTagged = applyAbsenteeTags(allLeadsFullyTagged);

// ----------------------------------------------------------------------------
// AUCTION DATA + EQUITY VERDICT
// PropertyOnion / IMAPP do not have public APIs — their data is populated by
// the user via inline edit form OR via CSV import. This pass:
//   1. Seeds realistic FJ + auction data on Foreclosure / Tax leads for demo
//   2. Computes verdict by comparing FJ to PA Total Value (the county's
//      official market-value assessment from the PA roll)
//   3. Computes days-until-auction for urgency badging
//
// Two-state verdict:
//   PURSUE   FJ ≤ PA Total Value — meaningful equity, worth pursuing
//   PASS     FJ > PA Total Value — eats into minimum wholesale profit margin
// ----------------------------------------------------------------------------
function computeEquityVerdict({ arvEstimate, repairsEstimate, finalJudgment, paTotalValue }) {
  if (!finalJudgment) return null;
  const repairs = repairsEstimate || 0;

  // PRIMARY VERDICT — anchored to PA Total Value. Two states only:
  //   PURSUE   FJ ≤ PA Total Value
  //   PASS     FJ > PA Total Value (eats into minimum wholesale profit margin)
  // No buffer / borderline tier. FJ above PA Total Value eats into the
  // minimum wholesale profit margin, so it's a pass.
  let verdict, color;
  let fjVsPaPct = null;
  if (paTotalValue) {
    fjVsPaPct = (finalJudgment / paTotalValue) * 100;
    if (fjVsPaPct <= 100)  { verdict = "PURSUE"; color = "#15803d"; }
    else                    { verdict = "PASS";   color = "#dc2626"; }
  } else if (arvEstimate) {
    // Fallback only when PA Total Value is unavailable
    const equityPct = (arvEstimate - finalJudgment) / arvEstimate;
    if (equityPct >= 0)    { verdict = "PURSUE"; color = "#15803d"; }
    else                    { verdict = "PASS";   color = "#dc2626"; }
  } else {
    return null;
  }

  // Supporting metrics
  const equityCushion = paTotalValue ? paTotalValue - finalJudgment :
                        arvEstimate  ? arvEstimate  - finalJudgment : 0;
  const equityPct = paTotalValue ? equityCushion / paTotalValue :
                    arvEstimate  ? equityCushion / arvEstimate  : 0;
  const maxSpread = arvEstimate ? (arvEstimate * 0.70) - repairs - finalJudgment : null;

  return { equityCushion, equityPct, fjVsPaPct, maxSpread, verdict, color };
}

function daysUntilAuction(auctionDateStr, today = new Date("2026-05-07")) {
  if (!auctionDateStr) return null;
  const ms = new Date(auctionDateStr).getTime() - today.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function applyAuctionData(leads) {
  return leads.map((lead) => {
    if (lead.soldAt) return lead;
    // Only PFC Auction (foreclosure auction stage) and Tax Default (which may
    // get reclassified to Tax Deed below if a TD case is found) get auction data.
    if (!hasListType(lead, "PFC Auction") && !hasListType(lead, "Tax Default")) return lead;

    // Seed deterministic auction data for ~80% of these leads.
    // In production this comes from your PropertyOnion CSV import or inline entry.
    const rand = mulberry32(lead.id * 8101 + 47);
    if (rand() < 0.20) return lead; // ~20% have no auction data yet (you haven't researched them)

    // Estimate ARV from a realistic Miami-Dade per-sqft for the zip.
    // Inline lookup here (PPSF_BY_ZIP is declared later in the file).
    const zip = (lead.propertyCity.match(/\d{5}/) || ["33147"])[0];
    const localPpsf = {
      "33131": 850, "33132": 720, "33137": 680, "33139": 750, "33145": 580,
      "33155": 480, "33157": 420, "33165": 380, "33170": 360, "33172": 360,
      "33175": 380, "33176": 420, "33178": 440, "33179": 360, "33186": 400,
      "33189": 380, "33147": 320, "33150": 320, "33167": 340, "33168": 340,
      "33125": 380, "33127": 360, "33128": 380, "33129": 580, "33130": 620,
      "33010": 360, "33012": 360, "33013": 360, "33014": 380, "33015": 380,
      "33016": 380, "33018": 400,
    };
    const ppsfBenchmark = localPpsf[zip] || 380;
    const sqft = 1200 + Math.floor(rand() * 1800); // 1200-3000 sqft
    const arvEstimate = Math.round((ppsfBenchmark * sqft) / 1000) * 1000;
    const repairsEstimate = Math.round((arvEstimate * (0.05 + rand() * 0.20)) / 1000) * 1000;

    const paRatio = 0.75 + rand() * 0.15;
    const paTotalValue = Math.round((arvEstimate * paRatio) / 1000) * 1000;

    let finalJudgment, certificateAmount, plaintiff, caseNumber;
    let reclassifiedType = lead.type;
    if (hasListType(lead, "PFC Auction")) {
      const verdictRoll = rand();
      const fjVsPaRatio = verdictRoll < 0.55 ? 0.40 + rand() * 0.55  // PURSUE: 40-95%
                       :                       1.02 + rand() * 0.65; // PASS: 102-167%
      finalJudgment = Math.round((paTotalValue * fjVsPaRatio) / 1000) * 1000;
      plaintiff = ["WELLS FARGO BANK NA", "BANK OF AMERICA NA", "JPMORGAN CHASE BANK NA", "U.S. BANK NA TRUSTEE", "OCWEN LOAN SERVICING LLC", "PENNYMAC LOAN SERVICES LLC", "MIAMI HARD MONEY LLC"][Math.floor(rand() * 7)];
      caseNumber = `2025-${String(1000 + Math.floor(rand() * 9000)).padStart(4, "0")}-CA-01`;
    } else {
      // Tax Default lead got auction data — that means a Tax Deed case has been
      // filed against it. Reclassify to Tax Deed (the auction-stage taxonomy).
      certificateAmount = Math.round((5000 + rand() * 35000) / 100) * 100;
      finalJudgment = certificateAmount; // for tax deeds, FJ = cert + interest + fees, simplified
      plaintiff = "MIAMI-DADE TAX COLLECTOR";
      caseNumber = `TD-2026-${String(1000 + Math.floor(rand() * 9000)).padStart(4, "0")}`;
      reclassifiedType = "Tax Deed Auction";
    }

    // Auction date and outcome assignment.
    // ~70% of auction-bound leads stay PENDING (auction is in the future).
    // ~30% have already happened with one of five terminal outcomes:
    //   - cancelled_bk     (bankruptcy automatic stay halted the auction)
    //   - cancelled_county (county action — procedural cancellation, often reschedules)
    //   - buyer_walked     (winning bidder failed to complete the purchase)
    //   - redeemed         (owner paid off the certificate before sale — Tax Deed specific)
    //   - sold             (property went to a third party at auction)
    // For sold outcomes, soldAt is also set since the deed transferred.
    // For other outcomes, the lead stays in active view — the underlying
    // motivation that put them in foreclosure is usually still present.
    let auctionDate, outcome = null, soldAt = lead.soldAt, soldDeedType = lead.soldDeedType;
    const outcomeRoll = rand();
    if (outcomeRoll < 0.70) {
      // Pending: future auction date, 0-180 days out
      const daysOut = Math.floor(15 + rand() * 165);
      auctionDate = new Date(2026, 4, 7 + daysOut).toISOString().slice(0, 10);
    } else {
      // Completed: past auction date, 5-90 days ago
      const outcomeSubRoll = rand();
      if (outcomeSubRoll < 0.20) outcome = "cancelled_bk";
      else if (outcomeSubRoll < 0.40) outcome = "cancelled_county";
      else if (outcomeSubRoll < 0.50) outcome = "buyer_walked";
      else if (outcomeSubRoll < 0.60) outcome = "redeemed";
      else {
        outcome = "sold";
        soldAt = auctionDate;
        soldDeedType = hasListType(lead, "Tax Deed Auction") ? "TXD" : "CDT"; // Tax Deed or Certificate of Title
      }
    }

    const verdict = computeEquityVerdict({ arvEstimate, repairsEstimate, finalJudgment, paTotalValue });
    // Lifecycle replace: Tax Default -> Tax Deed Auction when auction data attaches.
    // The PFC Auction path keeps its existing listTypes unchanged (no transition).
    const isLifecycleReplace = reclassifiedType === "Tax Deed Auction";
    const nowIso = new Date().toISOString();
    const newListTypes = isLifecycleReplace
      ? [...(lead.listTypes || []).filter((lt) => lt.name !== "Tax Default"), { name: "Tax Deed Auction", source: "auction-data-attach", verifiedAt: nowIso }]
      : lead.listTypes;
    const oldTaxDefaultEntry = isLifecycleReplace
      ? (lead.listTypes || []).find((lt) => lt.name === "Tax Default")
      : null;
    const newPreviousListTypes = oldTaxDefaultEntry
      ? [...(lead.previousListTypes || []), { ...oldTaxDefaultEntry, deactivatedAt: nowIso, deactivationReason: "tax-deed-case-filed" }]
      : lead.previousListTypes;

    return {
      ...lead,
      type: reclassifiedType,
      listTypes: newListTypes,
      previousListTypes: newPreviousListTypes,
      soldAt,
      soldDeedType,
      auctionData: {
        finalJudgment,
        certificateAmount,
        auctionDate,
        plaintiff,
        caseNumber,
        arvEstimate,
        repairsEstimate,
        paTotalValue,
        outcome,
        ...verdict,
        source: rand() < 0.55 ? "RealForeclose" : "PropertyOnion",
        importedAt: "2026-05-07",
      },
    };
  });
}

const allLeadsWithAuction = applyAuctionData(allLeadsFinalTagged);

// ----------------------------------------------------------------------------
// POSSIBLE PACE + REVERSE MORTGAGE DETECTION
//
// Possible PACE — Property Assessed Clean Energy loans appear on the Tax Roll
//   as a non-ad-valorem assessment. When recorded, next year's tax bill jumps
//   significantly (typically 2-4x) and stays elevated for the loan term.
//   Detection: year-over-year tax jump ≥80% with SAME OWNER both years
//   (continuity check filters out post-sale Save-Our-Homes resets).
//
// Reverse Mortgage — HECM loans are sometimes recorded with a $1 principal
//   to avoid doc stamps; the real amount lives on the HUD-1. Detection:
//   recorded mortgage with $1/$10/$100 principal AND/OR lender name matches
//   a known reverse-mortgage originator. Real loan amount + balance must be
//   manually entered (no public API).
// ----------------------------------------------------------------------------
const REVERSE_MORTGAGE_LENDERS = [
  "FINANCE OF AMERICA REVERSE",
  "AMERICAN ADVISORS GROUP",
  "AAG",
  "MUTUAL OF OMAHA REVERSE",
  "MUTUAL OF OMAHA MORTGAGE",
  "LIBERTY REVERSE",
  "LIBERTY HOME EQUITY",
  "REVERSE MORTGAGE FUNDING",
  "LONGBRIDGE FINANCIAL",
  "ONE REVERSE MORTGAGE",
  "HOMEBRIDGE FINANCIAL SERVICES",
  "FAIRWAY INDEPENDENT MORTGAGE", // partial — they originate HECMs
  "PHH MORTGAGE", // services HECMs
];

function isReverseMortgageLender(lenderName) {
  if (!lenderName) return false;
  const upper = lenderName.toUpperCase();
  return REVERSE_MORTGAGE_LENDERS.some((known) => upper.includes(known));
}

function detectPossiblePace(taxHistory, ownerHistory) {
  // taxHistory: [{ year, amount }, ...], ordered oldest → newest
  // ownerHistory: [{ year, owner }, ...]
  if (!taxHistory || taxHistory.length < 2) return null;
  for (let i = 1; i < taxHistory.length; i++) {
    const prev = taxHistory[i - 1];
    const curr = taxHistory[i];
    if (!prev.amount || !curr.amount) continue;
    const ratio = curr.amount / prev.amount;
    if (ratio < 1.80) continue; // not a doubling
    // Confirm same owner across the jump (filters out post-sale tax bumps)
    const prevOwner = ownerHistory?.find((o) => o.year === prev.year)?.owner;
    const currOwner = ownerHistory?.find((o) => o.year === curr.year)?.owner;
    if (prevOwner && currOwner && prevOwner !== currOwner) continue;
    return {
      jumpYear: curr.year,
      priorYearTax: prev.amount,
      jumpYearTax: curr.amount,
      multiplier: ratio,
      detected: true,
    };
  }
  return null;
}

// ----------------------------------------------------------------------------
// CODE VIOLATIONS — LIVE ARCGIS REST API INTEGRATION
//
// This is the FIRST live API integration in the dashboard. All other "data
// sources" (PropertyOnion, IMAPP, NARRPR, Realist, RealForeclose) are behind
// logins and require manual entry. Miami-Dade County publishes Code Compliance
// Violations as a public ArcGIS Open Data layer with a queryable REST endpoint.
//
// The endpoint URL and folio field name are USER-CONFIGURABLE in Settings
// because ArcGIS deployments occasionally restructure their services. The
// defaults below are best-effort based on the public Miami-Dade GIS index;
// confirm them by opening the URL in a browser — if you see a JSON page with
// "currentVersion", "fields", and a "type": "Feature Layer" block, the URL
// works. Otherwise paste the corrected URL into Settings.
//
// Item ID (from Miami-Dade Open Data Hub): da0e434c7a914bb983222393dab2b897
// ----------------------------------------------------------------------------
const DEFAULT_CODE_VIOLATIONS_API = {
  // Best-guess endpoint based on the public services index. The Miami-Dade
  // EnerGov folder is where their Land Management / Code Enforcement layers
  // live. If this URL 404s, open https://gisweb.miamidade.gov/arcgis/rest/services
  // and look for the FeatureServer with a "Violations" or "CodeCompliance" layer.
  endpoint: "https://gisweb.miamidade.gov/arcgis/rest/services/EnerGov/MD_LandMgtEditing/FeatureServer/0/query",
  folioField: "FOLIO",
  // Field names we try when extracting violation data from the response. The
  // first non-null value wins. Most ArcGIS deployments use ALL_CAPS field names.
  fieldMap: {
    caseNumber: ["CASE_NUMBER", "CASENUMBER", "CASE_NO", "CASEID"],
    issueDate:  ["ISSUE_DATE", "ISSUED_DATE", "OPEN_DATE", "DATE_ISSUED"],
    status:     ["STATUS", "CASE_STATUS", "VIOLATION_STATUS"],
    type:       ["VIOLATION_TYPE", "VIOLATIONTYPE", "TYPE", "DESCRIPTION"],
    description:["DESCRIPTION", "VIOLATION_DESCRIPTION", "NARRATIVE"],
    fine:       ["FINE_AMOUNT", "FINE", "PENALTY_AMOUNT", "AMOUNT_OWED"],
    address:    ["ADDRESS", "PROPERTY_ADDRESS", "FULL_ADDRESS"],
  },
  // What status values we consider "active" (still open, owner is being fined).
  activeStatuses: ["OPEN", "ACTIVE", "PENDING", "IN PROGRESS", "UNRESOLVED", "ISSUED", "OUTSTANDING"],
};

// Pick the first non-null field from a candidate list — handles schema variation
function pickField(record, fieldNames) {
  for (const name of fieldNames) {
    if (record[name] != null && record[name] !== "") return record[name];
  }
  return null;
}

// Normalize a raw ArcGIS feature into our internal shape
function normalizeViolation(feature, fieldMap) {
  const a = feature.attributes || {};
  return {
    caseNumber:  pickField(a, fieldMap.caseNumber),
    issueDate:   pickField(a, fieldMap.issueDate),
    status:      pickField(a, fieldMap.status),
    type:        pickField(a, fieldMap.type),
    description: pickField(a, fieldMap.description),
    fine:        Number(pickField(a, fieldMap.fine)) || 0,
    address:     pickField(a, fieldMap.address),
    raw:         a, // keep raw for debug
  };
}

// Convert ArcGIS epoch-ms timestamp (its standard date format) to YYYY-MM-DD
function arcgisDateToString(value) {
  if (value == null) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const n = Number(value);
  if (!isFinite(n)) return null;
  return new Date(n).toISOString().slice(0, 10);
}

// Query the Code Violations API for a given folio. Returns { violations, error }.
async function fetchCodeViolations(folio, apiConfig) {
  const config = { ...DEFAULT_CODE_VIOLATIONS_API, ...apiConfig };
  // Strip dashes from folio — Miami-Dade folios are often stored without dashes
  const cleanFolio = (folio || "").replace(/-/g, "");
  const params = new URLSearchParams({
    where: `${config.folioField}='${cleanFolio}'`,
    outFields: "*",
    returnGeometry: "false",
    f: "json",
  });
  const url = `${config.endpoint}?${params.toString()}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return { violations: [], error: `HTTP ${resp.status}` };
    const data = await resp.json();
    if (data.error) return { violations: [], error: data.error.message || "API error" };
    const features = data.features || [];
    const violations = features.map((f) => {
      const v = normalizeViolation(f, config.fieldMap);
      v.issueDate = arcgisDateToString(v.issueDate);
      return v;
    });
    return { violations, error: null };
  } catch (err) {
    return { violations: [], error: err.message || "Network error" };
  }
}

// Batch fetch violations for many folios in chunks. Returns a Map<folio, {violations, error}>.
// Uses ArcGIS IN () clause for efficient batched queries. Calls onProgress(current, total, foundSoFar)
// after each chunk so the UI can show progress. Aborts cleanly if signal.aborted becomes true.
async function fetchCodeViolationsBatch(folios, apiConfig, onProgress, abortSignal) {
  const config = { ...DEFAULT_CODE_VIOLATIONS_API, ...apiConfig };
  const results = new Map();
  // Initialize every folio with an empty result so even un-violated leads get cached
  folios.forEach((f) => results.set(normalizeFolio(f) || f, { violations: [], error: null }));

  // Chunk size of 80 keeps the query string under most servers' limits (~2000 chars).
  // Each folio is ~13 digits + quotes + comma = ~17 chars, so 80 × 17 = 1360 chars + base URL.
  const CHUNK_SIZE = 80;
  const PAGE_SIZE = 1000; // ArcGIS default maxRecordCount
  const cleanFolios = folios.map((f) => (f || "").replace(/-/g, "")).filter(Boolean);
  const chunks = [];
  for (let i = 0; i < cleanFolios.length; i += CHUNK_SIZE) {
    chunks.push(cleanFolios.slice(i, i + CHUNK_SIZE));
  }

  let processedFolios = 0;
  let totalViolationsFound = 0;
  let aggregateError = null;

  for (const chunk of chunks) {
    if (abortSignal?.aborted) break;
    // Build IN () clause — folios quoted, comma-separated
    const inClause = chunk.map((f) => `'${f}'`).join(",");
    let resultOffset = 0;
    let exceededTransferLimit = false;

    do {
      if (abortSignal?.aborted) break;
      const params = new URLSearchParams({
        where: `${config.folioField} IN (${inClause})`,
        outFields: "*",
        returnGeometry: "false",
        resultOffset: String(resultOffset),
        resultRecordCount: String(PAGE_SIZE),
        f: "json",
      });
      try {
        const resp = await fetch(`${config.endpoint}?${params.toString()}`);
        if (!resp.ok) {
          aggregateError = `HTTP ${resp.status} on chunk starting ${chunk[0]}`;
          break;
        }
        const data = await resp.json();
        if (data.error) {
          aggregateError = data.error.message || "API error";
          break;
        }
        const features = data.features || [];
        for (const feat of features) {
          const v = normalizeViolation(feat, config.fieldMap);
          v.issueDate = arcgisDateToString(v.issueDate);
          // Find which folio this record belongs to and bucket it accordingly
          const recFolio = normalizeFolio(feat.attributes?.[config.folioField]);
          if (recFolio && results.has(recFolio)) {
            results.get(recFolio).violations.push(v);
            totalViolationsFound++;
          }
        }
        exceededTransferLimit = data.exceededTransferLimit === true;
        resultOffset += features.length;
        if (features.length === 0) break; // safety
      } catch (err) {
        aggregateError = err.message || "Network error";
        break;
      }
    } while (exceededTransferLimit);

    if (aggregateError) break;
    processedFolios += chunk.length;
    if (onProgress) onProgress(processedFolios, cleanFolios.length, totalViolationsFound);
  }

  return { results, error: aggregateError, processedFolios, totalViolationsFound };
}

function isViolationActive(violation, apiConfig) {
  const config = { ...DEFAULT_CODE_VIOLATIONS_API, ...apiConfig };
  if (!violation.status) return true; // assume active if no status field
  const upper = String(violation.status).toUpperCase();
  return config.activeStatuses.some((s) => upper.includes(s));
}

// ----------------------------------------------------------------------------
// VIOLATION CATEGORY CLASSIFIER
// 13 specific target tags + a "Notice of Violation" catchall.
// Multi-tag: a single violation can match multiple tags (e.g. text containing
// both "Tall Grass" and "Junk" produces both tags).
// Order is significant for fire-alarm exclusion: shouldSkipForFireAlarm() is
// called inside the Fire matcher to avoid false positives.
//
// HARD SKIP: violations with status "Inspection Rejected" are filtered out
// entirely BEFORE reaching the classifier (in summarizeViolations).
// ----------------------------------------------------------------------------
const VIOLATION_CATEGORIES = [
  // === HIGHEST SEVERITY (+25): unsafe / unfit / lost-control ===
  {
    key: "UNSAFE_STRUCTURE",
    label: "Unsafe Structure",
    shortLabel: "Unsafe Structure",
    color: "#7c2d12", bgColor: "#fee2e2", borderColor: "#fca5a5",
    scoreBoost: 25,
    pattern: /(UNSAFE\s*STRUCTURE|UNSAFE\s*BUILDING|UNFIT\s*FOR\s*HABITATION|UNFIT\s*FOR\s*OCCUPANCY|CONDEMNED|RED\s*TAG)/i,
    playbook: "Property is officially unsafe to occupy. Owner has no path to keep it without major work they likely can't fund. Approach: \"The County has flagged your property as unsafe. I work specifically with owners in this situation — cash, as-is, we handle the violation cure with the County. Want a no-obligation offer?\"",
  },
  {
    key: "SQUATTERS",
    label: "Squatters",
    shortLabel: "Squatters",
    color: "#7c2d12", bgColor: "#fee2e2", borderColor: "#fca5a5",
    scoreBoost: 25,
    pattern: /(SQUATTER|UNAUTHORIZED\s*OCCUPAN|TRESPASSER\s*OCCUP|UNLAWFUL\s*OCCUPAN)/i,
    playbook: "Owner has lost physical control of the property — strongest forced-sale catalyst there is. Owners often want out fast and can't be picky. Approach: \"I understand your property has a difficult occupancy situation. We've helped other owners in this exact spot — we can buy the property as-is, take on the eviction process, and close fast.\"",
  },
  {
    key: "MIN_HOUSING",
    label: "Min Housing",
    shortLabel: "Min Housing",
    color: "#7c2d12", bgColor: "#fee2e2", borderColor: "#fca5a5",
    scoreBoost: 25,
    pattern: /(MINIMUM\s*HOUSING|MIN\.?\s*HSG|MIN\s*HOUSING|HABITABILITY|OWNER\s*VACATED\s*ABANDONMENT|\bOVA\b)/i,
    playbook: "Property fails minimum habitability code — electrical, plumbing, structural, or a combination. Owner generally has no resources to bring it up to code. Same playbook as Unsafe Structure: cash, as-is, fast close, you handle the County.",
  },
  {
    key: "DERELICT_COND",
    label: "Derelict Cond",
    shortLabel: "Derelict",
    color: "#7c2d12", bgColor: "#fee2e2", borderColor: "#fca5a5",
    scoreBoost: 25,
    pattern: /(DERELICT|DILAPIDATE)/i,
    playbook: "County has officially described the property as derelict — visible severe deterioration. Often abandoned or owned by someone unable to manage it. Approach the same as Unsafe Structure but with empathy if family circumstances are involved.",
  },
  {
    key: "UNKEPT_VACANT_PROPERTY",
    label: "Unkept Vacant Property",
    shortLabel: "Vacant Property",
    color: "#7c2d12", bgColor: "#fee2e2", borderColor: "#fca5a5",
    scoreBoost: 25,
    // Vacant improved property (has structure but no one's there)
    pattern: /(VACANT\s*(PROP|DWELL|HOUS|BUILD|RESIDEN)|UNOCCUPIED\s*(PROP|DWELL|HOUS|RESIDEN))/i,
    playbook: "Improved vacant property — building exists but nobody's there. Highest-conversion signal in this tier because the owner is reachable through skip-trace without anyone gatekeeping the conversation. Almost always inherited, in probate, or owned by an out-of-state absentee landlord. Approach: \"I noticed your property at [address] has been sitting vacant. I work with owners in this exact situation — most don't want to keep paying taxes and insurance on a property they're not using. Cash, as-is, fast close — would you be open to a no-obligation offer?\"",
  },
  // === HIGH SEVERITY (+20): structural & life-safety damage ===
  {
    key: "LIVING_STRUCTURE_VACANT_LOT",
    label: "Living Structure In Vacant Lot",
    shortLabel: "Living Struct on Lot",
    color: "#9a3412", bgColor: "#ffedd5", borderColor: "#fdba74",
    scoreBoost: 20,
    // Catches "Living/Dwelling Structure on Vacant/Unimproved Lot/Property"
    pattern: /(LIVING\s*STRUCTURE.*(VACANT|UNIMPROVED)|DWELLING.*(VACANT|UNIMPROVED)\s*(LOT|PROP|PARCEL)|STRUCTURE\s*ON\s*UNIMPROVED|UNPERMITTED\s*STRUCTURE|UNPERMITTED\s*DWELL)/i,
    playbook: "Often unpermitted structure on land zoned as vacant — legal mess to unwind, unfinanceable for retail buyers, owner usually can't afford to remove or legalize. Cash investor specialty.",
  },
  {
    key: "STRUCTURAL_DAMAGE",
    label: "Structural Damage",
    shortLabel: "Struct Damage",
    color: "#9a3412", bgColor: "#ffedd5", borderColor: "#fdba74",
    scoreBoost: 20,
    pattern: /(STRUCTURAL\s*DAMAGE|STRUCT\.?\s*DAMAGE|FOUNDATION\s*DAMAGE|ROOF\s*DAMAGE|COLLAPSE|COLLAPSING)/i,
    playbook: "Specific structural problem requiring real money. Property won't pass inspection for retail buyers. Conventional financing off the table. Cash and as-is.",
  },
  {
    key: "FIRE",
    label: "Fire",
    shortLabel: "Fire",
    color: "#9a3412", bgColor: "#ffedd5", borderColor: "#fdba74",
    scoreBoost: 20,
    // Match "fire" but exclude when the violation is *primarily* about fire alarm.
    // Logic handled in classifier (combined check), see classifyViolationTags().
    pattern: /\bFIRE\b/i,
    playbook: "Fire damage = uninsurable until cured, hard-money or cash-only buyers. Owner's insurance situation is often messy. Approach: \"I work with owners after fire incidents — we buy as-is, handle the insurance proceeds question, and you walk away clean.\"",
  },
  {
    key: "STRUCTURE_UPKEEP",
    label: "Structure Upkeep",
    shortLabel: "Structure Upkeep",
    color: "#9a3412", bgColor: "#ffedd5", borderColor: "#fdba74",
    scoreBoost: 20,
    pattern: /(STRUCTURE\s*MAINT|STRUCTURAL\s*MAINT|MAINT.*UPKEEP|\bUPKEEP\b|EXTERIOR\s*MAINT|PEELING\s*PAINT|DETERIORAT)/i,
    playbook: "Visible deterioration — peeling paint, sagging porch, broken windows. Property won't pass FHA appraisal. Owner often elderly, fixed-income, or absentee.",
  },
  // === MEDIUM SEVERITY (+15): visible-but-curable signals ===
  {
    key: "ABANDONED_VEHICLE",
    label: "Abandoned Vehicle",
    shortLabel: "Abandoned Veh",
    color: "#a16207", bgColor: "#fef3c7", borderColor: "#fcd34d",
    scoreBoost: 15,
    pattern: /(ABANDON.*VEHICLE|VEHICLE.*ABANDON|INOPERABLE\s*VEHICLE|JUNK\s*VEHICLE|JUNKED\s*VEHICLE|UNREGISTERED\s*VEHICLE)/i,
    playbook: "Strongly suggests the owner is unreachable or overwhelmed. Often correlates with hoarding, dementia, or a deceased owner whose heirs haven't taken action. Approach with sensitivity.",
  },
  {
    key: "JUNK_TRASH",
    label: "Junk/Trash",
    shortLabel: "Junk/Trash",
    color: "#a16207", bgColor: "#fef3c7", borderColor: "#fcd34d",
    scoreBoost: 15,
    pattern: /(JUNK|TRASH|OVERGROWTH|OVERGROWN|DEBRIS|LITTER|SANITATION)/i,
    playbook: "Classic absentee/inattentive-owner signal. Heirs, out-of-state owners, abandoned rentals, probate properties. High volume, high contact rate.",
  },
  // === LOWER PRIORITY (+10) ===
  {
    key: "UNKEPT_VACANT_LOT",
    label: "Unkept Vacant Lot",
    shortLabel: "Vacant Lot",
    color: "#854d0e", bgColor: "#fef9c3", borderColor: "#fde047",
    scoreBoost: 10,
    // Unimproved land — no structure
    pattern: /(UNIMPROVED\s*(LOT|PROP|PARCEL|LAND)|VACANT\s*LOT|VACANT\s*PARCEL|VACANT\s*LAND|EMPTY\s*LOT)/i,
    playbook: "Vacant unimproved land — lower priority for SFR wholesalers but still a signal. Often inherited or speculatively held by someone who's lost interest.",
  },
  {
    key: "TALL_GRASS",
    label: "Tall Grass",
    shortLabel: "Tall Grass",
    color: "#854d0e", bgColor: "#fef9c3", borderColor: "#fde047",
    scoreBoost: 10,
    pattern: /(TALL\s*GRASS|HIGH\s*GRASS|GRASS\s*HEIGHT|TALL\s*WEEDS|HIGH\s*WEEDS|GRASS\s*EXCEED|WEEDS\s*EXCEED|YARD\s*MAINT)/i,
    playbook: "Subset of Junk/Trash but lower-conversion alone. Still signals an inattentive owner. Pair with other tags for a stronger lead.",
  },
  // === CATCHALL (+5): everything else, including Work Without Permit ===
  {
    key: "NOTICE_OF_VIOLATION",
    label: "Notice of Violation",
    shortLabel: "NOV",
    color: "#475569", bgColor: "#f1f5f9", borderColor: "#cbd5e1",
    scoreBoost: 5,
    pattern: /.+/, // matches anything (catchall, applied last only if no other match)
    playbook: "Generic code-compliance notice — could be Work Without Permit, Expired Permit, Illegal Use, or any other violation type. Lower priority than the specific tags above but still indicates County interest, which often means the owner has either ignored the issue or can't resolve it. Worth a touch.",
    isCatchall: true,
  },
];

// Statuses that mean the violation should be excluded entirely from the dashboard
const VIOLATION_SKIP_STATUSES = ["INSPECTION REJECTED", "INSPECTION_REJECTED"];

function shouldSkipViolation(violation) {
  if (!violation) return false;
  const haystack = [violation.status, violation.type, violation.description].filter(Boolean).join(" | ").toUpperCase();
  return VIOLATION_SKIP_STATUSES.some((s) => haystack.includes(s));
}

// Returns true if the Fire pattern should be suppressed because the violation
// is *primarily* about fire alarm equipment rather than actual fire damage.
function isFireAlarmOnly(haystack) {
  // If "fire alarm" appears AND the rest of the violation has no other fire indicator,
  // suppress the Fire tag. Indicators that this IS a real fire issue: damage, burned,
  // smoke, structural language alongside fire.
  if (!/FIRE\s*ALARM|ALARM\s*SYSTEM/i.test(haystack)) return false;
  const realFireIndicators = /(FIRE\s*DAMAGE|FIRE\s*INCIDENT|BURNED|BURNT|SMOKE\s*DAMAGE|FIRE\s*INSPECTION\s*FAIL|POST.?FIRE)/i;
  if (realFireIndicators.test(haystack)) return false;
  return true;
}

// Multi-tag classifier — returns ALL matching tag keys for a violation.
// More specific tags appear before general ones in VIOLATION_CATEGORIES so the
// most-relevant tag is first in the returned array.
function classifyViolationTags(violation) {
  const haystack = [violation.type, violation.description, violation.raw?.VIOLATION_TYPE, violation.raw?.DESCRIPTION]
    .filter(Boolean)
    .join(" | ")
    .toUpperCase();
  const matchedTags = [];
  let nonCatchallMatched = false;
  for (const cat of VIOLATION_CATEGORIES) {
    if (cat.isCatchall) continue; // handle after the loop
    if (!cat.pattern.test(haystack)) continue;
    // Special-case Fire: skip if it's only a fire alarm issue
    if (cat.key === "FIRE" && isFireAlarmOnly(haystack)) continue;
    matchedTags.push(cat.key);
    nonCatchallMatched = true;
  }
  // If nothing else matched, use the catchall (Notice of Violation)
  if (!nonCatchallMatched) {
    matchedTags.push("NOTICE_OF_VIOLATION");
  }
  return matchedTags;
}

// Backwards-compat shim: returns the FIRST tag (most specific) from the multi-tag classifier.
// Used by older code paths that expect a single category. New code should use classifyViolationTags.
function classifyViolation(violation) {
  const tags = classifyViolationTags(violation);
  return tags[0] || null;
}

// Bucket violations by tag and compute total stacked boost.
// Multi-tag: one violation contributes to every tag it matches. Each unique
// tag boosts only once even if multiple violations match it. Total cap +30.
function summarizeViolations(violations, apiConfig) {
  const byCategory = {};
  let totalBoost = 0;
  const seenBoostKeys = new Set();

  for (const v of violations) {
    if (shouldSkipViolation(v)) continue; // hard skip: Inspection Rejected
    const isActive = isViolationActive(v, apiConfig);
    const tagKeys = classifyViolationTags(v);
    // Add this violation to the bucket for EVERY tag it matches
    for (const tagKey of tagKeys) {
      if (!byCategory[tagKey]) byCategory[tagKey] = { active: 0, resolved: 0, totalFines: 0, items: [] };
      if (isActive) byCategory[tagKey].active++;
      else byCategory[tagKey].resolved++;
      // Don't double-count fines across multiple tag buckets — only count on the primary tag
      if (tagKey === tagKeys[0]) byCategory[tagKey].totalFines += (v.fine || 0);
      byCategory[tagKey].items.push({ ...v, _categoryKey: tagKey, _isActive: isActive });
      // Score boost — only for ACTIVE violations, dedupe per unique tag
      if (isActive && !seenBoostKeys.has(tagKey)) {
        seenBoostKeys.add(tagKey);
        const cat = VIOLATION_CATEGORIES.find((c) => c.key === tagKey);
        if (cat) totalBoost += cat.scoreBoost;
      }
    }
  }

  const cappedBoost = Math.min(30, totalBoost);
  return { byCategory, scoreBoost: cappedBoost };
}

function applyTaxAndMortgageTags(leads) {
  return leads.map((lead) => {
    if (lead.soldAt) return lead;

    const rand = mulberry32(lead.id * 9173 + 31);

    // Synthesize tax history (5 years) + owner continuity for the demo.
    // In production these come from the PA bulk feed (annual tax rolls) and
    // the deed history. Distribution: ~7% have a PACE-shaped tax jump.
    const baseTax = 2500 + Math.floor(rand() * 6500);
    const hasPaceJump = rand() < 0.08;
    const jumpAtYearIdx = 2 + Math.floor(rand() * 2); // year 2 or 3 of 5
    const paceMultiplier = 2.0 + rand() * 1.5; // 2.0x - 3.5x
    const taxHistory = [];
    for (let yIdx = 0; yIdx < 5; yIdx++) {
      const year = 2021 + yIdx;
      let amount;
      if (hasPaceJump && yIdx >= jumpAtYearIdx) {
        amount = Math.round(baseTax * paceMultiplier * (1 + (yIdx - jumpAtYearIdx) * 0.03));
      } else {
        amount = Math.round(baseTax * (1 + yIdx * 0.04)); // ~4% annual creep
      }
      taxHistory.push({ year, amount });
    }
    const ownerHistory = taxHistory.map((t) => ({ year: t.year, owner: lead.owner }));
    const paceDetection = detectPossiblePace(taxHistory, ownerHistory);

    // Synthesize reverse mortgage data. Distribution: ~5% have a reverse mortgage
    // (skewed toward Senior leads — boost rate from 5% to 25% if Senior tagged).
    const rmBoostRate = (lead.paTags || []).includes("Senior") ? 0.25 : 0.04;
    const hasReverseMortgage = rand() < rmBoostRate;
    let reverseMortgage = null;
    if (hasReverseMortgage) {
      const lender = REVERSE_MORTGAGE_LENDERS[Math.floor(rand() * REVERSE_MORTGAGE_LENDERS.length)];
      const yrsAgo = 1 + Math.floor(rand() * 12);
      const recordedDate = `${2026 - yrsAgo}-${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}-15`;
      // Recorded principal is the $1 / $10 / $100 trick on ~70% of records
      const recordedPrincipal = rand() < 0.70 ? [1, 10, 100][Math.floor(rand() * 3)] : Math.round((150000 + rand() * 250000) / 1000) * 1000;
      reverseMortgage = {
        detected: true,
        lender,
        recordedDate,
        recordedPrincipal,
        usesDocStampWorkaround: recordedPrincipal <= 100,
        // Actual loan amount + current balance: manually-entered fields
        actualLoanAmount: null,
        currentBalance: null,
        notes: null,
      };
    }

    if (!paceDetection && !reverseMortgage) {
      return { ...lead, taxHistory };
    }

    const newFlags = [...lead.flags];
    let scoreAdj = 0;
    if (paceDetection) {
      if (!newFlags.includes("Possible PACE")) newFlags.push("Possible PACE");
      scoreAdj += 20;
    }
    if (reverseMortgage) {
      if (!newFlags.includes("Reverse Mortgage")) newFlags.push("Reverse Mortgage");
      scoreAdj += 15;
    }
    if (!newFlags.includes("STACKED") && newFlags.length >= 3) newFlags.push("STACKED");

    return {
      ...lead,
      taxHistory,
      possiblePace: paceDetection,
      reverseMortgage,
      score: Math.min(100, lead.score + scoreAdj),
      flags: newFlags,
    };
  });
}

const allLeadsWithTaxMortgage = applyTaxAndMortgageTags(allLeadsWithAuction);

// ----------------------------------------------------------------------------
// BAD CONDITION SCORE
// A separate 0-100 score derived from property-condition signals (Vacant,
// Major Work needed, D4D-list match). Also boosts the main motivation score
// (capped at +30 like other tag categories). The signals come from two
// sources: (1) the user's driving-for-dollars scouting (manual marks on the
// lead) and (2) CSV imports from a D4D app that tags addresses by visible
// distress. Same lead can have multiple condition tags.
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// BAD CONDITION TAGS — 4 dimensions, each answering a different question
//
// The old flat 5-tag list confused the user because tags like "Vacant + Major
// Work" and "D4D + Major Work" mashed occupancy + condition + observation
// source into single buttons, making them feel like variants of the same
// signal. The new structure breaks them apart so each click adds ONE clear
// piece of information.
//
// Single-select dimensions (Occupancy, Work Needed, Source): clicking a tag
// replaces any prior selection in the same dimension. Multi-select (Visual
// Cues): independent toggles.
//
// Scoring: each tag contributes to both the Bad Condition Score (0-100) and
// the main motivation score (capped at +30 for the entire BCS category, so
// a fully-distressed property doesn't blow past the score ceiling).
// ----------------------------------------------------------------------------
const BAD_CONDITION_DIMENSIONS = [
  {
    key: "occupancy",
    label: "OCCUPANCY",
    renderGroup: "row1",     // shares visual row with observation source
    selectMode: "single",
    tags: [
      { key: "Vacant",   label: "Vacant",   badConditionPoints: 25, mainScoreBoost: 12, color: "#dc2626", bgColor: "#fee2e2", borderColor: "#fecaca", description: "Property is unoccupied — boarded windows, accumulating mail, no visible activity, neglected yard." },
      { key: "Occupied", label: "Occupied", badConditionPoints: 0,  mainScoreBoost: 0,  color: "#64748b", bgColor: "#f1f5f9", borderColor: "#e2e8f0", description: "Someone living at the property currently. Neutral signal — motivation must come from elsewhere." },
    ],
  },
  {
    key: "source",
    label: "OBSERVATION SOURCE",
    renderGroup: "row1",     // shares visual row with occupancy
    selectMode: "single",
    tags: [
      { key: "D4D",        label: "D4D",        badConditionPoints: 15, mainScoreBoost: 7, color: "#16a34a", bgColor: "#dcfce7", borderColor: "#bbf7d0", description: "Driving 4 Dollars — physically observed in-person. Highest confidence; what you saw is what's actually there." },
      { key: "GSV Recent", label: "GSV Recent", badConditionPoints: 10, mainScoreBoost: 5, color: "#0284c7", bgColor: "#e0f2fe", borderColor: "#bae6fd", description: "Google Street View imagery less than ~2 years old. Reasonable confidence — property condition is usually still close to what's shown." },
      { key: "GSV Old",    label: "GSV Old",    badConditionPoints: 3,  mainScoreBoost: 1, color: "#78716c", bgColor: "#f5f5f4", borderColor: "#e7e5e4", description: "Google Street View imagery 3+ years old. Low confidence — property may have been repaired, rehabbed, or further deteriorated since the imagery was captured. Verify before committing." },
    ],
  },
  {
    key: "work",
    label: "WORK NEEDED",
    renderGroup: "row2",
    selectMode: "single",
    tags: [
      { key: "No Work Needed", label: "No Work Needed", badConditionPoints: 0,  mainScoreBoost: 0,  color: "#0d9488", bgColor: "#ccfbf1", borderColor: "#99f6e4", description: "Turnkey condition — no repairs needed. Could be sold retail through a Realtor; motivation must come from estate, divorce, distance, or other non-condition reasons." },
      { key: "Work Needed",    label: "Work Needed",    badConditionPoints: 15, mainScoreBoost: 7,  color: "#d97706", bgColor: "#fef3c7", borderColor: "#fde68a", description: "Moderate repair work needed — cosmetic plus light systems updates. Probably below retail-ready but not severe." },
      { key: "Major Work",     label: "Major Work",     badConditionPoints: 35, mainScoreBoost: 17, color: "#e11d48", bgColor: "#ffe4e6", borderColor: "#fecdd3", description: "Significant rehab needed — roof, systems, or structural. Owner typically can't fix (no capital) and can't sell retail (no buyer). High motivation." },
    ],
  },
  {
    key: "visual",
    label: "VISUAL CUES",
    renderGroup: "row3",
    selectMode: "multi",
    tags: [
      { key: "Boarded Up",        label: "Boarded Up",        badConditionPoints: 25, mainScoreBoost: 12, color: "#ea580c", bgColor: "#ffedd5", borderColor: "#fed7aa", description: "Windows or doors boarded — strong abandonment signal. Often paired with code violations." },
      { key: "Overgrown",         label: "Overgrown",         badConditionPoints: 15, mainScoreBoost: 7,  color: "#65a30d", bgColor: "#ecfccb", borderColor: "#d9f99d", description: "Long grass, untrimmed bushes, weeds — owner not maintaining property. Cheap mowing-fine violations are typically the first sign." },
      { key: "Fire Damage",       label: "Fire Damage",       badConditionPoints: 30, mainScoreBoost: 15, color: "#db2777", bgColor: "#fce7f3", borderColor: "#fbcfe8", description: "Visible fire damage — burn marks, smoke staining, charred wood, partial collapse. Often complicated by insurance claims and title issues." },
      { key: "Water Damage",      label: "Water Damage",      badConditionPoints: 30, mainScoreBoost: 15, color: "#0891b2", bgColor: "#cffafe", borderColor: "#a5f3fc", description: "Visible water damage — staining, mold, flood waterline, sagging ceilings. Major repair + remediation cost; lenders typically won't finance until cured." },
      { key: "Structural Damage", label: "Structural Damage", badConditionPoints: 30, mainScoreBoost: 15, color: "#4f46e5", bgColor: "#e0e7ff", borderColor: "#c7d2fe", description: "Foundation issues, sagging walls, wall cracks, partial collapse, or settling. Highest-cost repair category; often makes properties uninsurable until cured." },
      { key: "Chained Fence",     label: "Chained Fence",     badConditionPoints: 15, mainScoreBoost: 7,  color: "#7c3aed", bgColor: "#ede9fe", borderColor: "#ddd6fe", description: "Fence is padlocked or chained shut. Often signals abandonment, family dispute, or someone deliberately preventing access. Worth investigating who's controlling access." },
      { key: "Junk and Trash",    label: "Junk and Trash",    badConditionPoints: 15, mainScoreBoost: 7,  color: "#52525b", bgColor: "#f4f4f5", borderColor: "#e4e4e7", description: "Accumulated junk, trash piles, abandoned appliances, scattered debris in yard. Common with hoarders, neglected estate properties, and squatter situations." },
      { key: "Old Roof",          label: "Old Roof",          badConditionPoints: 10, mainScoreBoost: 5,  color: "#ca8a04", bgColor: "#fef9c3", borderColor: "#fde047", description: "Roof appears aged (faded/curling shingles, discoloration) but not actively damaged. Insurance carriers in Florida often non-renew at 15+ years; owner may already be facing premium hikes or coverage gaps." },
      { key: "Roof Damaged",      label: "Roof Damaged",      badConditionPoints: 20, mainScoreBoost: 10, color: "#c026d3", bgColor: "#fae8ff", borderColor: "#f5d0fe", description: "Visible roof damage — tarp, missing tiles/shingles, sagging, daylight visible, post-hurricane damage. Active issue requiring near-term repair." },
    ],
  },
];

// Flattened view for scoring / filtering / lookup helpers
const BAD_CONDITION_TAGS = BAD_CONDITION_DIMENSIONS.flatMap((d) => d.tags.map((t) => ({ ...t, dimension: d.key })));

const BAD_CONDITION_KEYS = BAD_CONDITION_TAGS.map((t) => t.key);

// Compute the Bad Condition Score (0-100) from a lead's condition tags.
// Caps at 100. Multiple tags stack but each tag contributes once.
function computeBadConditionScore(conditionTags) {
  if (!Array.isArray(conditionTags) || conditionTags.length === 0) return 0;
  const seen = new Set();
  let total = 0;
  for (const key of conditionTags) {
    if (seen.has(key)) continue;
    seen.add(key);
    const tag = BAD_CONDITION_TAGS.find((t) => t.key === key);
    if (tag) total += tag.badConditionPoints;
  }
  return Math.min(100, total);
}

// Compute the main-score boost from condition tags. Capped at +30 like other
// tag categories so a fully-distressed property doesn't blow past the score
// ceiling on condition alone.
function computeBadConditionMainBoost(conditionTags) {
  if (!Array.isArray(conditionTags) || conditionTags.length === 0) return 0;
  const seen = new Set();
  let total = 0;
  for (const key of conditionTags) {
    if (seen.has(key)) continue;
    seen.add(key);
    const tag = BAD_CONDITION_TAGS.find((t) => t.key === key);
    if (tag) total += tag.mainScoreBoost;
  }
  return Math.min(30, total);
}

function applyBadConditionTags(leads) {
  // CONDITION TAGS ARE 100% MANUAL.
  //
  // Earlier this function deterministically auto-distributed Vacant/D4D tags
  // to ~20% of leads to make the dashboard look populated for demo purposes.
  // That was wrong: condition tags represent actual on-the-ground scouting
  // observations, and synthesizing them would mislead the user into thinking
  // properties had been verified when they hadn't.
  //
  // Now: leads start with no conditionTags. The user marks each property as
  // they scout it via the Manual Marks buttons in the lead detail modal
  // (Vacant / Vacant + Major Work / D4D / D4D + Major Work / GSV + Major Work).
  // The toggle handler in the modal sets `lead.conditionTags`, recomputes
  // `badConditionScore`, and applies the score boost.
  //
  // In future, if condition data arrives via a CSV import (e.g., a D4D scouting
  // list with verified marks), those imported tags can be merged in here.
  return leads;
}

const allLeadsWithCondition = applyBadConditionTags(allLeadsWithTaxMortgage);

// ----------------------------------------------------------------------------
// PROBATE STATUS — assign active/dismissed/closed status to Probate-type leads.
// In production this comes from court filings cross-referenced by case number.
// Distribution:
//   ~50% active     (case open, heirs in process — best outreach window)
//   ~25% dismissed  (case fell apart, heir might still want out — re-engageable)
//   ~25% closed     (estate distributed, deed transfer imminent or already done)
// ----------------------------------------------------------------------------
function applyProbateStatus(leads) {
  return leads.map((lead) => {
    if (!hasListType(lead, "Probate")) return lead;
    if (lead.probateStatus) return lead; // respect explicit assignment
    const rand = mulberry32(lead.id * 7321 + 11);
    const roll = rand();
    let probateStatus;
    if (roll < 0.50) probateStatus = "active";
    else if (roll < 0.75) probateStatus = "dismissed";
    else probateStatus = "closed";
    return { ...lead, probateStatus };
  });
}

const allLeadsWithProbate = applyProbateStatus(allLeadsWithCondition);

// ----------------------------------------------------------------------------
// PROPERTY TYPE SYNTHESIS
// In the demo, property type is generated deterministically per lead.id to keep
// the dataset stable across reloads. In production, this field comes from the
// PA DOR landuse code on the bulk-data import (Phase 1 of the migration plan)
// or from the MLS Property Type column when MLS data enriches a lead.
//
// Categories match the wholesaler's working taxonomy:
//   SFR         — single-family detached residential (the bread-and-butter)
//   Condo/TH    — condominium or attached townhouse
//   Mobile      — mobile home / manufactured housing
//   2-4 Unit    — duplex/triplex/quadruplex (small multifamily)
//   5-20 Unit   — small apartment building (mid multifamily)
//   Vacant Lot  — unimproved land
//
// Distribution roughly tracks real Miami-Dade residential composition,
// weighted toward what a wholesale operator typically encounters.
// ----------------------------------------------------------------------------
const PROPERTY_TYPES = [
  { key: "SFR",         color: "#16a34a", weight: 0.60 },
  { key: "Condo/TH",    color: "#2563eb", weight: 0.22 },
  { key: "2-4 Unit",    color: "#7c3aed", weight: 0.07 },
  { key: "Mobile",      color: "#ea580c", weight: 0.05 },
  { key: "5-20 Unit",   color: "#dc2626", weight: 0.03 },
  { key: "Vacant Lot",  color: "#64748b", weight: 0.03 },
];
const PROPERTY_TYPE_BY_KEY = Object.fromEntries(PROPERTY_TYPES.map((p) => [p.key, p]));

function applyPropertyType(leads) {
  return leads.map((lead) => {
    if (lead.propertyType) return lead; // already set (e.g. from MLS import)
    // Deterministic pick by lead.id using cumulative weight distribution
    const rand = mulberry32(lead.id * 4099 + 91)();
    let cum = 0;
    let pick = PROPERTY_TYPES[0].key;
    for (const t of PROPERTY_TYPES) {
      cum += t.weight;
      if (rand < cum) { pick = t.key; break; }
    }
    return { ...lead, propertyType: pick };
  });
}

const allLeadsWithPropertyType = applyPropertyType(allLeadsWithProbate);

// ----------------------------------------------------------------------------
// STACK COUNT DERIVATION
// Count of distinct *motivation signals* present on a lead. Different from
// lead.flags.length, which mixes signal flags with priority labels (HIGH/
// MEDIUM/LOW), urgency markers (AUCTION 27d), and meta tags (STACKED itself).
//
// Each signal below represents a different category of distress / opportunity.
// A lead with stack=5 has five distinct reasons to be a wholesale target,
// which is materially different from a lead with five copies of the same kind
// of flag.
// ----------------------------------------------------------------------------
function deriveStackCount(lead) {
  let n = 0;
  if (lead.estateTag) n++;
  if (lead.absenteeTier) n++;
  if (lead.codeViolationsSummary?.activeCount > 0) n++;
  if (lead.possiblePi) n++;
  if (lead.possiblePace) n++;
  if (lead.reverseMortgage) n++;
  if (Array.isArray(lead.conditionTags) && lead.conditionTags.length > 0) n++;
  if (lead.mlsStatus === "Expired" || lead.mlsStatus === "Canceled" || lead.mlsStatus === "Came Back") n++;
  if (lead.equity === "HIGH" || lead.equity === "VERY HIGH") n++;
  if (lead.auctionData?.verdict === "PURSUE") n++;
  if (Array.isArray(lead.paTags) && lead.paTags.length > 0) n++;
  if (lead.probateStatus === "active") n++;
  return n;
}

function applyStackCount(leads) {
  return leads.map((lead) => ({ ...lead, stackCount: deriveStackCount(lead) }));
}

const allLeadsWithStackCount = applyStackCount(allLeadsWithPropertyType);

// ----------------------------------------------------------------------------
// APPROXIMATE EQUITY DOLLAR DERIVATION
// Converts the tier label (LOW / MEDIUM / HIGH / VERY HIGH) plus PA total
// value into a rough dollar figure the wholesaler can scan at a glance:
// "this lead has ~$228K equity" reads instantly; "this lead has HIGH equity
// on a $350K property" requires mental math.
//
// Method (deliberately rough — this is wholesaler quick-scan, not a CMA):
//   1. Estimate market value:
//      - First choice: PA total value × 1.25 (Miami-Dade PA assesses
//        at roughly 75-85% of market)
//      - Fallback: MLS list price (if currently listed)
//      - Fallback: last sale price × 1.1 (some appreciation buffer)
//   2. Apply equity ratio by tier:
//      - VERY HIGH:  90% of market (free-and-clear or close to it)
//      - HIGH:       65% (substantial equity)
//      - MEDIUM:     40% (workable but tight)
//      - LOW:        15% (probably underwater after closing costs)
//   3. Round to nearest $1K to signal "this is approximate"
//
// In production, when real mortgage balance data flows in via Realist / RESO
// API, this calculation is replaced by actual equity = (market - mortgage -
// liens). The current synthesis is honest about its limits via the column
// name ("Equity Approx") and the cell tooltip.
// ----------------------------------------------------------------------------
const EQUITY_TIER_RATIO = {
  "VERY HIGH": 0.90,
  "HIGH":      0.65,
  "MEDIUM":    0.40,
  "LOW":       0.15,
};

function deriveApproxEquity(lead) {
  // Estimate market value — best signal first, then fallbacks
  let marketValue = 0;
  if (lead.paTotalValue && lead.paTotalValue > 0) {
    marketValue = lead.paTotalValue * 1.25;
  } else if (lead.mlsListPrice && lead.mlsListPrice > 0) {
    marketValue = lead.mlsListPrice;
  } else if (lead.lastSalePrice && lead.lastSalePrice > 0) {
    marketValue = lead.lastSalePrice * 1.1;
  } else {
    return null;
  }
  const ratio = EQUITY_TIER_RATIO[lead.equity];
  if (ratio == null) return null;
  // Round to nearest $1K to make it look like an estimate, not a precise number
  return Math.round((marketValue * ratio) / 1000) * 1000;
}

function applyEquityApprox(leads) {
  return leads.map((lead) => ({ ...lead, equityApproxAmount: deriveApproxEquity(lead) }));
}

const allLeadsWithEquityApprox = applyEquityApprox(allLeadsWithStackCount);

// ----------------------------------------------------------------------------
// ALERTS ENGINE
// In production this runs after each ingestion cycle. detectAlerts(prev, next)
// is called for every lead whose record changed; each rule checks one field
// transition and emits zero or more alert events. The alerts feed the in-app
// inbox, GHL workflow triggers, and any Slack/email/SMS routing the user chose.
// ----------------------------------------------------------------------------
const ALERT_TYPES = {
  outreach_unlocked: {
    label: "Outreach Unlocked",
    icon: "Bell",
    color: "#16a34a",
    priority: "high",
    description: "MLS listing went to Expired or Canceled — direct seller outreach is now legally clear.",
  },
  came_back_to_market: {
    label: "Came Back to Market",
    icon: "TrendingUp",
    color: "#f97316",
    priority: "medium",
    description: "Pending → Active. Buyer fell through, seller is frustrated. Outreach still blocked while listing is live.",
  },
  new_lis_pendens: {
    label: "New Lis Pendens",
    icon: "Scale",
    color: "#dc2626",
    priority: "high",
    description: "Pre-foreclosure filed. First 7 days are highest conversion.",
  },
  tax_deed_filed: {
    label: "Tax Deed Application",
    icon: "Gavel",
    color: "#dc2626",
    priority: "high",
    description: "~3 months to forced sale. Seller has a hard deadline.",
  },
  code_lien_recorded: {
    label: "Code Lien Recorded",
    icon: "AlertCircle",
    color: "#2563eb",
    priority: "medium",
    description: "Municipal lien just attached. Carrying cost just went up.",
  },
  deed_recorded: {
    label: "Deed Recorded",
    icon: "FileText",
    color: "#64748b",
    priority: "high",
    description: "Property changed hands. Lead may need to close or have its owner rewritten.",
  },
  score_threshold_crossed: {
    label: "Score Crossed Hot",
    icon: "Flame",
    color: "#dc2626",
    priority: "medium",
    description: "Motivation score crossed into Hot tier (≥70). Time-sensitive lead.",
  },
};

// Rules engine — pure functions. Each takes (prevLead, nextLead) and returns
// zero or more alert events. The ingestion pipeline calls all rules, dedupes,
// and inserts into the alerts table.
function detectAlerts(prev, next) {
  const out = [];
  if (!prev) return out;

  // Rule 1: outreach unlocked (MLS Active/Pending → Expired/Canceled)
  const wasBlocked = prev.outreachBlocked;
  const nowExpiredOrCanceled = next.mlsStatus === "Expired" || next.mlsStatus === "Canceled";
  if (wasBlocked && nowExpiredOrCanceled) {
    out.push({
      type: "outreach_unlocked",
      leadId: next.id,
      payload: {
        from: prev.mlsStatus,
        to: next.mlsStatus,
        listPriceWasAt: prev.mlsListPrice,
        daysOnMarket: prev.mlsDaysOnMarket,
      },
    });
  }

  // Rule 2: came back to market (Pending → Active)
  if (prev.mlsStatus === "Pending" && next.mlsStatus === "Active") {
    out.push({ type: "came_back_to_market", leadId: next.id, payload: { listPrice: next.mlsListPrice } });
  }

  // Rule 3: score crossed into Hot
  if (prev.score < 70 && next.score >= 70) {
    out.push({
      type: "score_threshold_crossed",
      leadId: next.id,
      payload: { from: prev.score, to: next.score },
    });
  }

  // Other rules (new_lis_pendens, tax_deed_filed, code_lien_recorded, deed_recorded)
  // fire from the public-records ingestion side; they're stubbed here for the demo.
  return out;
}

// Generate a realistic backlog of mock alerts for the demo. In production the
// alerts table is populated by detectAlerts() running on every ingestion cycle.
function seedAlerts(leads) {
  const today = new Date("2026-05-07");
  const alerts = [];
  let id = 1;

  // Outreach Unlocked alerts — for any current Expired/Canceled lead, simulate
  // that it transitioned from Active/Pending in the last 1-30 days.
  leads.filter((l) => l.mlsStatus === "Expired" || l.mlsStatus === "Canceled").forEach((l) => {
    const rand = mulberry32(l.id * 31);
    const daysAgo = Math.floor(rand() * 30) + 1;
    const at = new Date(today);
    at.setDate(at.getDate() - daysAgo);
    alerts.push({
      id: id++,
      type: "outreach_unlocked",
      leadId: l.id,
      at: at.toISOString(),
      read: daysAgo > 7,
      payload: {
        from: rand() < 0.6 ? "Active" : "Pending",
        to: l.mlsStatus,
        listPriceWasAt: l.mlsListPrice,
        daysOnMarket: l.mlsDaysOnMarket,
      },
    });
  });

  // Came Back to Market alerts
  leads.filter((l) => l.mlsStatus === "Came Back").forEach((l) => {
    const rand = mulberry32(l.id * 47);
    const daysAgo = Math.floor(rand() * 14) + 1;
    const at = new Date(today);
    at.setDate(at.getDate() - daysAgo);
    alerts.push({
      id: id++,
      type: "came_back_to_market",
      leadId: l.id,
      at: at.toISOString(),
      read: daysAgo > 5,
      payload: { listPrice: l.mlsListPrice },
    });
  });

  // Score Crossed Hot — pick the top 3 hottest leads, simulate they crossed in last week
  leads.filter((l) => l.score >= 70).slice(0, 4).forEach((l, i) => {
    const at = new Date(today);
    at.setDate(at.getDate() - (i + 1));
    alerts.push({
      id: id++,
      type: "score_threshold_crossed",
      leadId: l.id,
      at: at.toISOString(),
      read: i > 1,
      payload: { from: 65, to: l.score },
    });
  });

  // New Lis Pendens — for each Lis Pendens lead, alert at the filed date
  leads.filter((l) => hasListType(l, "Pre-Foreclosure")).slice(0, 3).forEach((l) => {
    alerts.push({
      id: id++,
      type: "new_lis_pendens",
      leadId: l.id,
      at: new Date(l.filed).toISOString(),
      read: false,
      payload: { amount: l.amount },
    });
  });

  // Sort newest first
  return alerts.sort((a, b) => b.at.localeCompare(a.at));
}

const seedAlertsBase = (() => {
  const baseAlerts = seedAlerts(allLeadsWithEquityApprox);
  // Add deed_recorded alerts from the Clerk deed feed
  const deedAlerts = seedDeedsBase.map((d, i) => ({
    id: 10000 + i,
    type: "deed_recorded",
    leadId: d.leadId,
    at: new Date(d.recordedDate + "T10:00:00Z").toISOString(),
    read: i > 4,
    payload: {
      deedType: d.deedType,
      grantee: d.grantee,
      action: d.action,
      salePrice: d.inferredSalePrice,
      docStamps: d.docStamps,
    },
  }));
  return [...baseAlerts, ...deedAlerts].sort((a, b) => b.at.localeCompare(a.at));
})();

// ----------------------------------------------------------------------------
// COMP TOOL DATA LAYER
// In production this is a thin wrapper over the MIAMI MLS RESO Web API:
//   GET /Property?$filter=StandardStatus eq 'Closed'
//                    and CloseDate ge {6mo ago}
//                    and CountyOrParish eq 'Miami-Dade'
//                    and LivingArea ge {min} and LivingArea le {max}
//                    and geo.distance(Coordinates, POINT(lng lat)) le {miles}
// All field names below match the RESO Data Dictionary so the swap is a no-op.
// ----------------------------------------------------------------------------
function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Approximate centroids for Miami-Dade zip codes (good enough for demo geometry)
const ZIP_CENTROIDS = {
  "33010": [25.8420, -80.2784], "33012": [25.8612, -80.3034], "33030": [25.4683, -80.4775],
  "33055": [25.9550, -80.2772], "33125": [25.7806, -80.2356], "33131": [25.7617, -80.1918],
  "33132": [25.7831, -80.1855], "33137": [25.8083, -80.1937], "33139": [25.7836, -80.1303],
  "33140": [25.8200, -80.1290], "33141": [25.8505, -80.1267], "33142": [25.8033, -80.2367],
  "33145": [25.7493, -80.2417], "33146": [25.7178, -80.2741], "33147": [25.8359, -80.2367],
  "33150": [25.8434, -80.2200], "33155": [25.7367, -80.3215], "33156": [25.6745, -80.3134],
  "33157": [25.6233, -80.3417], "33162": [25.9270, -80.1700], "33165": [25.7367, -80.3445],
  "33167": [25.8748, -80.2228], "33169": [25.9384, -80.2389], "33177": [25.6045, -80.4019],
  "33180": [25.9559, -80.1359], "33183": [25.6900, -80.4100], "33186": [25.6790, -80.4017],
};

// Median market PPSF by zip (Miami-Dade closed-sale benchmarks, used for mock realism)
const PPSF_BY_ZIP = {
  "33131": 850, "33132": 700, "33137": 580, "33139": 850, "33140": 700, "33141": 600,
  "33145": 520, "33146": 750, "33147": 320, "33150": 350, "33125": 480, "33142": 380,
  "33155": 400, "33156": 580, "33157": 380, "33162": 420, "33165": 420, "33167": 360,
  "33169": 320, "33177": 320, "33180": 700, "33183": 380, "33186": 380, "33010": 360,
  "33012": 380, "33030": 280, "33055": 320,
};

function zipFromCity(cityStr) {
  const m = (cityStr || "").match(/(\d{5})/);
  return m ? m[1] : null;
}

// Folio prefix → municipality. The first two digits of a Miami-Dade folio
// identify the taxing jurisdiction. Comps must share this prefix with the
// subject — different prefix = different municipality = different market.
// Authoritative Miami-Dade folio prefix → municipality lookup.
// This is the canonical list of municipalities the user works in.
// Prefixes not in this table will display as "Prefix NN" — by design,
// since they represent areas (Miami Beach, Aventura, etc.) the user doesn't
// pursue. Don't add municipalities here without explicit user input.
const FOLIO_PREFIX_TO_MUNICIPALITY = {
  "01": "Miami",
  "03": "Coral Gables",
  "04": "Hialeah",
  "05": "Miami Springs",
  "06": "North Miami",
  "07": "North Miami Beach",
  "08": "Opa-Locka",
  "09": "South Miami",
  "10": "Homestead",
  "11": "Miami Shores",
  "15": "West Miami",
  "16": "Florida City",
  "17": "Biscayne Park",
  "18": "El Portal",
  "22": "Medley",
  "25": "Sweetwater",
  "26": "Virginia Gardens",
  "27": "Hialeah Gardens",
  "30": "Miami",
  "32": "Miami Lakes",
  "33": "Palmetto Bay",
  "34": "Miami Gardens",
  "36": "Cutler Bay",
};

// Always-visible jurisdictions in the sidebar — the rest collapse into a
// "More jurisdictions ▾" expander to keep the sidebar manageable.
const PINNED_PREFIXES = ["01", "30", "34", "08", "10", "04", "27"];

function folioPrefix(folio) {
  const m = (folio || "").match(/^(\d{2})/);
  return m ? m[1] : null;
}

// Derive the subject property's characteristics from the lead row.
// In production, sqft/beds/baths come from the PA bulk data join on folio.
function inferSubject(lead) {
  const zip = zipFromCity(lead.propertyCity);
  const [lat, lng] = ZIP_CENTROIDS[zip] || [25.7617, -80.1918];
  const isCondo = /UNIT|#|APT|CONDO/i.test(lead.propertyAddress) || /CONDO/i.test(lead.legalDesc || "");
  const prefix = folioPrefix(lead.folio);
  return {
    lat, lng,
    propertyType: isCondo ? "Condominium" : "Residential",
    propertySubType: isCondo ? "Condominium" : "SingleFamilyResidence",
    livingArea: isCondo ? 980 : 1750,
    bedrooms: isCondo ? 2 : 3,
    bathrooms: 2,
    yearBuilt: isCondo ? 2005 : 1975,
    zipCode: zip,
    folioPrefix: prefix,
    municipality: FOLIO_PREFIX_TO_MUNICIPALITY[prefix] || "Unknown",
  };
}

// Seedable PRNG so the same lead always yields the same comp set across re-renders
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generates ~30 RESO-shaped comp records clustered around the subject.
// Each record uses RESO Data Dictionary field names — direct 1:1 with MIAMI MLS API.
function generateCompsForSubject(lead, subject) {
  const seedKey = parseInt(String(lead.id) + (subject.zipCode || "0"), 10) || 1;
  const rand = mulberry32(seedKey);
  const basePpsf = PPSF_BY_ZIP[subject.zipCode] || 400;
  const today = new Date("2026-05-07");
  const condoStreets = ["NE 1ST AVE", "NE 2ND AVE", "BISCAYNE BLVD", "NE 4TH AVE", "NE 36TH ST"];
  const sfrStreets = ["NW 7TH AVE", "SW 8TH ST", "NE 79TH ST", "SW 27TH AVE", "BIRD RD", "FLAGLER ST", "NW 36TH ST", "SW 67TH AVE"];
  const streets = subject.propertyType === "Condominium" ? condoStreets : sfrStreets;
  const cityName = lead.propertyCity.split(",")[0].trim();
  const comps = [];

  for (let i = 0; i < 28; i++) {
    // Distance: 55% within 0.5mi, 30% within 1mi, 15% within 2mi
    const dRoll = rand();
    const distance = dRoll < 0.55 ? rand() * 0.5 : dRoll < 0.85 ? 0.5 + rand() * 0.5 : 1 + rand() * 1;
    // Random bearing → lat/lng offset (rough but accurate enough at this scale)
    const bearing = rand() * 2 * Math.PI;
    const dLat = (distance / 69) * Math.cos(bearing);
    const dLng = (distance / (69 * Math.cos((subject.lat * Math.PI) / 180))) * Math.sin(bearing);
    const lat = subject.lat + dLat;
    const lng = subject.lng + dLng;
    // Sqft varies ±35% from subject (some will be filtered by ±25%)
    const livingArea = Math.round(subject.livingArea * (0.65 + rand() * 0.7));
    // PPSF varies ±15% around market benchmark
    const ppsf = basePpsf * (0.85 + rand() * 0.3);
    // 12% distressed sales
    const stRoll = rand();
    const saleType = stRoll < 0.06 ? "REO" : stRoll < 0.12 ? "ShortSale" : "ArmsLength";
    const distressedDiscount = saleType === "REO" ? 0.78 : saleType === "ShortSale" ? 0.85 : 1;

    // BuyerFinancing — RESO field. Distribution is realistic for Miami-Dade:
    // ~30% cash (investors, foreign buyers, flippers), ~50% conventional, ~15% FHA, ~5% VA.
    // Distressed sales (REO/ShortSale) are 70% cash because lenders won't finance them as-is.
    let buyerFinancing;
    if (saleType !== "ArmsLength") {
      buyerFinancing = rand() < 0.7 ? "Cash" : "Conventional";
    } else {
      const fRoll = rand();
      if (fRoll < 0.30)      buyerFinancing = "Cash";
      else if (fRoll < 0.80) buyerFinancing = "Conventional";
      else if (fRoll < 0.95) buyerFinancing = "FHA";
      else                   buyerFinancing = "VA";
    }
    // Cash buyers tend to negotiate harder (5-10% under market), FHA/VA buyers
    // pay full asking + concessions because they're owner-occs in love with the house
    const financingMultiplier =
      buyerFinancing === "Cash" ? 0.92 + rand() * 0.06 :
      buyerFinancing === "FHA"  ? 1.00 + rand() * 0.05 :
      buyerFinancing === "VA"   ? 1.00 + rand() * 0.05 :
                                  0.97 + rand() * 0.06;

    const closePrice = Math.round((livingArea * ppsf * distressedDiscount * financingMultiplier) / 1000) * 1000;
    // Close date spread across last 8 months
    const monthsBack = rand() * 8;
    const closeDate = new Date(today);
    closeDate.setDate(closeDate.getDate() - Math.round(monthsBack * 30));
    const streetNum = 100 + Math.floor(rand() * 9900);
    const street = streets[Math.floor(rand() * streets.length)];
    const unit = subject.propertyType === "Condominium" ? ` #${100 + Math.floor(rand() * 1900)}` : "";

    // 80% of generated comps share subject's folio prefix + zip (the matchable pool).
    // 20% have a different prefix or zip — these exist in the pool but the hard match
    // filter drops them before any other filter runs. This mirrors what happens with
    // a real RESO query when nearby parcels span a municipal boundary.
    const sharesJurisdiction = rand() < 0.8;
    const compFolioPrefix = sharesJurisdiction
      ? (subject.folioPrefix || "30")
      : String(30 + Math.floor(rand() * 7)).padStart(2, "0");
    const compZip = sharesJurisdiction
      ? (subject.zipCode || "33137")
      : String(33000 + Math.floor(rand() * 200));

    comps.push({
      ListingId: `A${10000000 + Math.floor(rand() * 89999999)}`,
      StandardStatus: "Closed",
      MlsStatus: "Closed",
      ClosePrice: closePrice,
      ListPrice: Math.round(closePrice * (0.97 + rand() * 0.08)),
      CloseDate: closeDate.toISOString().slice(0, 10),
      LivingArea: livingArea,
      BedroomsTotal: Math.max(1, subject.bedrooms + Math.round(rand() * 2 - 1)),
      BathroomsTotalInteger: Math.max(1, subject.bathrooms + Math.round(rand() * 2 - 1)),
      YearBuilt: subject.yearBuilt + Math.round(rand() * 20 - 10),
      PropertyType: "Residential",
      PropertySubType: subject.propertySubType,
      StreetAddress: `${streetNum} ${street}${unit}`,
      City: cityName,
      StateOrProvince: "FL",
      PostalCode: compZip,
      Latitude: lat,
      Longitude: lng,
      ParcelNumber: `${compFolioPrefix}-${String(2000 + i * 11).padStart(4, "0")}-${String(i % 30).padStart(3, "0")}-${String((i * 7) % 9999).padStart(4, "0")}`,
      DaysOnMarket: 5 + Math.floor(rand() * 90),
      SaleType: saleType,
      BuyerFinancing: buyerFinancing,
      ConcessionsAmount: rand() < 0.3 ? Math.round((rand() * 8000) / 500) * 500 : 0,
      _distanceMiles: distance,
      _ppsf: closePrice / livingArea,
    });
  }
  return comps;
}

function filterComps(comps, { maxDistance, sqftMin, sqftMax, sinceDate, excludeDistressed, requirePrefix, requireZip }) {
  return comps.filter((c) => {
    // HARD FILTER: jurisdiction match. Different folio prefix or zip = different
    // market, never compared. This runs before any other filter.
    if (requirePrefix && folioPrefix(c.ParcelNumber) !== requirePrefix) return false;
    if (requireZip && c.PostalCode !== requireZip) return false;
    if (c._distanceMiles > maxDistance) return false;
    if (c.LivingArea < sqftMin || c.LivingArea > sqftMax) return false;
    if (c.CloseDate < sinceDate) return false;
    if (excludeDistressed && c.SaleType !== "ArmsLength") return false;
    return true;
  });
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function percentile(arr, p) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const i = Math.max(0, Math.min(s.length - 1, Math.round((p / 100) * (s.length - 1))));
  return s[i];
}

// ----------------------------------------------------------------------------
// SCORING (the same logic the ingestion pipeline applies on import)
// ----------------------------------------------------------------------------
// LEAD TYPES — flat list with optional `family` for sidebar grouping.
// EST OF / Possible EST OF / Inherited variants are tags that cross-cut these
// types; the sidebar will render virtual rows like "Tax Deed EST OF" that
// filter to (type=Tax Deed AND estateTag=EST OF). The actual `lead.type`
// value is one of these top-level keys.
const LEAD_TYPES = [
  // Tax Deed Auction family — auction date set, most urgent
  { key: "Tax Deed Auction", family: "Tax Deed Auction", icon: Gavel, color: "#dc2626" },
  // Tax Deed family — case filed, no auction date yet (mid-stage)
  { key: "Tax Deed", family: "Tax Deed", icon: Gavel, color: "#b91c1c" },
  // Pre-Foreclosure Auction family — auction imminent
  { key: "PFC Auction", family: "Pre-Foreclosure Auction", icon: Gavel, color: "#ea580c" },
  // Pre-Foreclosure family — Lis Pendens filed, not yet at auction
  { key: "Pre-Foreclosure", family: "Pre-Foreclosure", icon: Scale, color: "#f97316" },
  // Tax Default family — delinquent taxes, certificate stage
  { key: "Tax Default", family: "Tax Default", icon: Receipt, color: "#eab308" },
  // Inherited family — two distinct deed-type signals
  { key: "Inherited Probate", family: "Inherited", icon: Home, color: "#0891b2" },
  { key: "Inherited QCD", family: "Inherited", icon: Home, color: "#0e7490" },
  // Probate (court-stage)
  { key: "Probate", family: "Probate", icon: UserCircle, color: "#16a34a" },
  // Adverse Possession — moved up from PA Tag because it's its own pursuit category
  { key: "Adverse Possession", family: "Adverse Possession", icon: Star, color: "#9333ea" },
];

// Property Lien tier classification — used in two paths:
//
//   1. NEW LEAD CREATION: when a Property Lien is first ingested (CSV import,
//      scraper, manual entry), call classifyPropertyLien(amount) to assign
//      the correct tier as the initial type.
//
//   2. AMOUNT REFRESH: when scrapers re-fetch a lien and the amount has
//      changed (interest accruing, partial payment, additional sub-liens
//      attached to the same case), call reclassifyPropertyLien(lead, newAmount)
//      which recomputes the tier and updates the lead's type if the new tier
//      differs from the current one. Idempotent — safe to call on every scrape.
//
// Boundary handling:
//   - <$50K:     amount in [0, 50000)
//   - $50-100K:  amount in [50000, 100000)
//   - $100K+:    amount in [100000, ∞)
//
// Edge case — paid-off lien (amount === 0): the function returns the <$50K
// tier as the literal classification. In production, the scraper layer should
// detect amount=0 and either remove the Property Lien classification entirely
// (if no other signal supports the lead) or transition to a different lead
// type. That logic lives at the scraper boundary, not here.
function classifyPropertyLien(amount) {
  const a = Number(amount) || 0;
  if (a < 50000) return "<$50K";
  if (a < 100000) return "$50-100K";
  return "$100K+";
}
// Set of lienType values that belong to the Property Liens family (government-
// issued, per decisions archive Section 2.20). Tiering applies only to these
// sub-types - Other Liens (private creditor), Federal Tax Liens, and Judgments
// are not tiered.
const PROPERTY_LIEN_TYPES = new Set([
  "code-violations-lien",
  "building-violation-lien",
  "demolition-lien",
  "lot-clearance-lien",
  "water-lien",
  "unsafe-structure-lien",
]);
// Re-classify a specific Property Lien within a lead when its amount changes.
// Locates the lien by lienId, verifies it's a governmental (Property Liens
// family) lien, then updates that lien's amount and tier. Returns a new lead
// object with the lien array updated, OR returns the original lead unchanged
// if the lien isn't found, isn't a Property Liens family lien, or the new
// amount produces the same tier value (so React doesn't re-render unnecessarily).
// Other liens in the array are unchanged. See decisions archive Section 2.20
// for the full lien model (Property Liens = government-issued; tiering is
// per-lien not per-lead; lead.liens[] is the canonical multi-lien array).
function reclassifyPropertyLien(lead, lienId, newAmount) {
  if (!lead || !Array.isArray(lead.liens)) return lead;
  const targetIdx = lead.liens.findIndex((l) => l.lienId === lienId);
  if (targetIdx === -1) return lead;
  const existingLien = lead.liens[targetIdx];
  if (!PROPERTY_LIEN_TYPES.has(existingLien.lienType)) return lead;
  const newTier = classifyPropertyLien(newAmount);
  if (newTier === existingLien.tier && newAmount === existingLien.amount) return lead;
  const newLiens = lead.liens.slice();
  newLiens[targetIdx] = { ...existingLien, amount: newAmount, tier: newTier };
  return { ...lead, liens: newLiens };
}

// ----------------------------------------------------------------------------
// LIST TYPE TAXONOMY (Step 2 — new shape)
//
// The 18 canonical List Type names. Each lead can belong to multiple Lists
// simultaneously via lead.listTypes[]. Replaces the legacy single-value
// lead.type model. Stack Count = listTypes.length.
//
// Order is the "primary List" priority used when a single display value is
// needed (badge color, sort key). Ordered by motivation strength — auction-
// stage signals dominate, scouting signals (D4D) rank last.
// ----------------------------------------------------------------------------
const LIST_TYPE_NAMES = [
  "Tax Deed Auction",
  "PFC Auction",
  "Adverse Possession",
  "Pre-Foreclosure",
  "Tax Default",
  "Tax Deed",
  "Probate",
  "Inherited Probate",
  "Inherited QCD",
  "Unlawful Detainer",
  "Eviction",
  "Property Liens",
  "Federal Tax Liens",
  "Other Liens",
  "Judgments",
  "Deceased",
  "Deceased/2nd Owner",
  "Possible Deceased",
  "LE / REM",
  "Code Violations",
  "D4D",
];

// Priority lookup: lower number = higher priority. Derived from
// LIST_TYPE_NAMES so the two cannot drift apart.
const LIST_TYPE_PRIORITY = Object.fromEntries(
  LIST_TYPE_NAMES.map((name, idx) => [name, idx])
);

// Lien-family parent blocks for the 2.7d 4-parent-block sidebar render.
// Each entry drives one of the four parent sections (PROPERTY LIENS,
// FEDERAL TAX LIENS, OTHER LIENS, JUDGMENTS). Property Liens has tier
// sub-sections; the other three have only estate-tag leaves. Counts come
// from totals.byListType[name] at render time.
const LIEN_PARENT_BLOCKS = [
  { name: "Property Liens",    icon: AlertCircle, color: "#2563eb", tiers: ["<$50K", "$50-100K", "$100K+"] },
  { name: "Federal Tax Liens", icon: AlertCircle, color: "#7f1d1d", tiers: null },
  { name: "Other Liens",       icon: AlertCircle, color: "#475569", tiers: null },
  { name: "Judgments",         icon: Landmark,    color: "#7c3aed", tiers: null },
];

// Legacy lead.estateTag → new Deceased-family List name.
// estateTag is being retired in favor of explicit Deceased-family List memberships.
const ESTATE_TAG_TO_LIST_TYPE = {
  "EST OF": "Deceased",
  "EST OF 2nd Owner": "Deceased/2nd Owner",
  "Possible EST OF": "Possible Deceased",
  "LE / REM": "LE / REM",
};

// Legacy lead.probateStatus → new Probate sub-status. Three legacy values map
// to three of the five new sub-statuses. The other two (Inactive, Re-Opened)
// only appear once the Phase 2.3 Probate scraper produces them.
const PROBATE_STATUS_TO_SUB_STATUS = {
  active: "Active",
  closed: "Closed - Completed",
  dismissed: "Closed - Dismissed",
};

// Legacy lien-family lead.type values -> record shape for the new per-record
// lead.liens[] array. Six legacy types (Prop Liens x 3, Federal Tax Lien,
// Other Liens, Judgment) map to four canonical List Types per 2.7d's
// 4-parent-block model. Tier preserved at the record level.
const LEGACY_LIEN_TYPE_TO_RECORD = {
  "Prop Liens <$50K":    { type: "Property Liens",   tier: "<$50K"    },
  "Prop Liens $50-100K": { type: "Property Liens",   tier: "$50-100K" },
  "Prop Liens $100K+":   { type: "Property Liens",   tier: "$100K+"   },
  "Federal Tax Lien":    { type: "Federal Tax Liens", tier: null      },
  "Other Liens":         { type: "Other Liens",       tier: null      },
  "Judgment":            { type: "Judgments",         tier: null      },
};
const LEGACY_LIEN_TYPES = new Set(Object.keys(LEGACY_LIEN_TYPE_TO_RECORD));

// Simple (non-lien, non-Deceased-family) legacy lead.type values that map
// 1:1 to a List name. These get a straightforward listTypes membership.
const SIMPLE_LEGACY_TYPE_TO_LIST_TYPE = {
  "Tax Deed Auction":   "Tax Deed Auction",
  "Tax Deed":           "Tax Deed",
  "PFC Auction":        "PFC Auction",
  "Pre-Foreclosure":    "Pre-Foreclosure",
  "Tax Default":        "Tax Default",
  "Inherited Probate":  "Inherited Probate",
  "Inherited QCD":      "Inherited QCD",
  "Probate":            "Probate",
  "Adverse Possession": "Adverse Possession",
};

// Convert a legacy-shape lead to a partially-new lead. Adds listTypes (always),
// liens (when applicable), previousListTypes (always empty in Step 2).
// Does NOT remove lead.type, lead.estateTag, lead.probateStatus — those are
// retired in Sub-edit 2.7 once nothing reads them.
//
// Idempotent: calling on an already-converted lead returns it unchanged
// (detected via existing listTypes array). Safe to call from the fetch
// normalization, seed flow, and any apply* dual-write paths.
function legacyToNewShape(lead) {
  if (!lead) return lead;
  // Already converted — Sub-edit 2.1 and the seed flow may both touch a lead.
  if (Array.isArray(lead.listTypes)) return lead;

  const today = new Date().toISOString().slice(0, 10);
  const listTypes = [];
  const liens = Array.isArray(lead.liens) ? [...lead.liens] : [];

  // Map lead.type → membership (or Liens membership + record).
  if (lead.type) {
    if (SIMPLE_LEGACY_TYPE_TO_LIST_TYPE[lead.type]) {
      const membership = {
        name: SIMPLE_LEGACY_TYPE_TO_LIST_TYPE[lead.type],
        source: "ported-from-type",
        verifiedAt: today,
      };
      // Attach probate sub-status when applicable.
      if (lead.type === "Probate" && PROBATE_STATUS_TO_SUB_STATUS[lead.probateStatus]) {
        membership.status = PROBATE_STATUS_TO_SUB_STATUS[lead.probateStatus];
      }
      listTypes.push(membership);
    } else if (LEGACY_LIEN_TYPES.has(lead.type)) {
      // Per the 2.7d 4-parent-block model, the legacy lien type determines
      // which canonical List Type membership to push (Property Liens,
      // Federal Tax Liens, Other Liens, or Judgments). The record-level
      // type/tier distinction is preserved in lead.liens[].
      const record = LEGACY_LIEN_TYPE_TO_RECORD[lead.type];
      listTypes.push({
        name: record.type,
        source: "ported-from-type",
        verifiedAt: today,
      });
      liens.push({
        type: record.type,
        tier: record.tier,
        amount: lead.amount || 0,
        recordedAt: lead.filed || null,
        source: "ported-from-type",
      });
    }
    // Unknown lead.type silently produces no listTypes entry — matches
    // existing dashboard behavior, which already treats unknown types as bugs.
  }

  // Map lead.estateTag → Deceased-family membership.
  if (lead.estateTag && ESTATE_TAG_TO_LIST_TYPE[lead.estateTag]) {
    listTypes.push({
      name: ESTATE_TAG_TO_LIST_TYPE[lead.estateTag],
      source: "ported-from-estateTag",
      verifiedAt: today,
    });
  }

  // Sort by priority — lowest LIST_TYPE_PRIORITY value (highest priority) first.
  // Enables getPrimaryLeadType and similar helpers to read listTypes[0] for primary.
  // Unknown names sort to the end (defensive: future scraper output may include
  // names not yet added to LIST_TYPE_NAMES).
  listTypes.sort((a, b) => {
    const pa = LIST_TYPE_PRIORITY[a.name] ?? Number.MAX_SAFE_INTEGER;
    const pb = LIST_TYPE_PRIORITY[b.name] ?? Number.MAX_SAFE_INTEGER;
    return pa - pb;
  });
  return {
    ...lead,
    listTypes,
    previousListTypes: [],
    liens,
  };
}

// Predicate used at all read sites: does this lead currently belong to the
// named List? Replaces legacy `lead.type === X` and `lead.estateTag === Y`
// equality checks throughout the dashboard.
function hasListType(lead, name) {
  return Array.isArray(lead?.listTypes) && lead.listTypes.some((lt) => lt.name === name);
}

// Set of LIST_TYPE_NAMES that correspond to legacy LEAD_TYPES with colors.
// Lists in this Set render in the LEAD TYPE badge and sidebar; Lists NOT in
// this Set are estate signals (Deceased family, LE/REM), peripheral signals
// (Code Violations, D4D), or new-taxonomy Lists not yet wired to the legacy UI
// (Eviction, Unlawful Detainer).
const LEAD_TYPE_KEYS = new Set(LEAD_TYPES.map((t) => t.key));

// Returns the highest-priority listType.name that's a Lead Type (per LEAD_TYPE_KEYS).
// Assumes lead.listTypes is priority-sorted (enforced by legacyToNewShape).
// Returns null if the lead has no Lead Type memberships — caller handles fallback.
function getPrimaryLeadType(lead) {
  if (!Array.isArray(lead?.listTypes)) return null;
  for (const lt of lead.listTypes) {
    if (LEAD_TYPE_KEYS.has(lt.name)) return lt.name;
  }
  return null;
}

// Virtual sidebar rows: lead-type + tag intersections that the user wants
// available as one-click filters. Each renders under its parent family group
// and filters to leads matching BOTH conditions.
// Format: { key: virtual-row label, type: lead-type to match, tag: estate tag, family }
// `tag: "__OTHER__"` is a sentinel meaning "type matches AND lead has NO
// estate tag at all" (i.e., not EST OF, not Possible EST OF, not LE/REM, etc.)
const ESTATE_TAG_KEYS = ["EST OF", "Possible EST OF", "EST OF 2nd Owner", "LE / REM"];
// Note on label fields: `key` is the full unambiguous identifier used in
// state, counters, and exports. `shortLabel` is what renders in the sidebar —
// the family prefix is dropped since the family header above already provides
// that context, leaving more visual room for the actual tag/outcome text.
const LEAD_TYPE_TAG_INTERSECTIONS = [
  // Tax Deed Auction family (auction-stage)
  { key: "Tax Deed Auction EST OF", shortLabel: "Deceased", type: "Tax Deed Auction", tag: "EST OF", family: "Tax Deed Auction" },
  { key: "Tax Deed Auction EST OF 2nd Owner", shortLabel: "Deceased/2nd Owner", type: "Tax Deed Auction", tag: "EST OF 2nd Owner", family: "Tax Deed Auction" },
  { key: "Tax Deed Auction Possible EST OF", shortLabel: "Possible Deceased", type: "Tax Deed Auction", tag: "Possible EST OF", family: "Tax Deed Auction" },
  { key: "Tax Deed Auction Other", shortLabel: "Other", type: "Tax Deed Auction", tag: "__OTHER__", family: "Tax Deed Auction" },
  // Tax Deed Auction outcomes
  { key: "Tax Deed Auction Cancelled BK", shortLabel: "Cancelled — BK", type: "Tax Deed Auction", outcome: "cancelled_bk", family: "Tax Deed Auction" },
  { key: "Tax Deed Auction Cancelled County", shortLabel: "Cancelled — County", type: "Tax Deed Auction", outcome: "cancelled_county", family: "Tax Deed Auction" },
  { key: "Tax Deed Auction Buyer Walked", shortLabel: "Buyer Walked", type: "Tax Deed Auction", outcome: "buyer_walked", family: "Tax Deed Auction" },
  { key: "Tax Deed Auction Redeemed", shortLabel: "Redeemed by Owner", type: "Tax Deed Auction", outcome: "redeemed", family: "Tax Deed Auction" },
  { key: "Tax Deed Auction Sold", shortLabel: "Sold at Auction", type: "Tax Deed Auction", outcome: "sold", family: "Tax Deed Auction" },
  // Tax Deed family (case filed, no auction yet)
  { key: "Tax Deed EST OF", shortLabel: "Deceased", type: "Tax Deed", tag: "EST OF", family: "Tax Deed" },
  { key: "Tax Deed EST OF 2nd Owner", shortLabel: "Deceased/2nd Owner", type: "Tax Deed", tag: "EST OF 2nd Owner", family: "Tax Deed" },
  { key: "Tax Deed Possible EST OF", shortLabel: "Possible Deceased", type: "Tax Deed", tag: "Possible EST OF", family: "Tax Deed" },
  { key: "Tax Deed Other", shortLabel: "Other", type: "Tax Deed", tag: "__OTHER__", family: "Tax Deed" },
  // PFC Auction family
  { key: "PFC Auction EST OF", shortLabel: "Deceased", type: "PFC Auction", tag: "EST OF", family: "Pre-Foreclosure Auction" },
  { key: "PFC Auction EST OF 2nd Owner", shortLabel: "Deceased/2nd Owner", type: "PFC Auction", tag: "EST OF 2nd Owner", family: "Pre-Foreclosure Auction" },
  { key: "PFC Auction Possible EST OF", shortLabel: "Possible Deceased", type: "PFC Auction", tag: "Possible EST OF", family: "Pre-Foreclosure Auction" },
  { key: "PFC Auction Other", shortLabel: "Other", type: "PFC Auction", tag: "__OTHER__", family: "Pre-Foreclosure Auction" },
  // PFC Auction outcomes
  { key: "PFC Auction Cancelled BK", shortLabel: "Cancelled — BK", type: "PFC Auction", outcome: "cancelled_bk", family: "Pre-Foreclosure Auction" },
  { key: "PFC Auction Cancelled County", shortLabel: "Cancelled — County", type: "PFC Auction", outcome: "cancelled_county", family: "Pre-Foreclosure Auction" },
  { key: "PFC Auction Buyer Walked", shortLabel: "Buyer Walked", type: "PFC Auction", outcome: "buyer_walked", family: "Pre-Foreclosure Auction" },
  { key: "PFC Auction Redeemed", shortLabel: "Redeemed by Owner", type: "PFC Auction", outcome: "redeemed", family: "Pre-Foreclosure Auction" },
  { key: "PFC Auction Sold", shortLabel: "Sold at Auction", type: "PFC Auction", outcome: "sold", family: "Pre-Foreclosure Auction" },
  // Pre-Foreclosure family
  { key: "PFC EST OF", shortLabel: "Deceased", type: "Pre-Foreclosure", tag: "EST OF", family: "Pre-Foreclosure" },
  { key: "PFC EST OF 2nd Owner", shortLabel: "Deceased/2nd Owner", type: "Pre-Foreclosure", tag: "EST OF 2nd Owner", family: "Pre-Foreclosure" },
  { key: "PFC Possible EST OF", shortLabel: "Possible Deceased", type: "Pre-Foreclosure", tag: "Possible EST OF", family: "Pre-Foreclosure" },
  { key: "PFC Other", shortLabel: "Other", type: "Pre-Foreclosure", tag: "__OTHER__", family: "Pre-Foreclosure" },
  // Tax Default family
  { key: "Tax Default EST OF", shortLabel: "Deceased", type: "Tax Default", tag: "EST OF", family: "Tax Default" },
  { key: "Tax Default EST OF 2nd Owner", shortLabel: "Deceased/2nd Owner", type: "Tax Default", tag: "EST OF 2nd Owner", family: "Tax Default" },
  { key: "Tax Default Possible EST OF", shortLabel: "Possible Deceased", type: "Tax Default", tag: "Possible EST OF", family: "Tax Default" },
  { key: "Tax Default Other", shortLabel: "Other", type: "Tax Default", tag: "__OTHER__", family: "Tax Default" },
  // Probate family — status-based intersections via lead.probateStatus.
  // No EST OF / Possible EST OF intersections here because a probate
  // proceeding IS an estate by definition; adding the estate-tag refinement
  // on top would be redundant and confusing.
  { key: "Probate Active", shortLabel: "Active", type: "Probate", probateStatus: "active", family: "Probate" },
  { key: "Probate Dismissed", shortLabel: "Dismissed", type: "Probate", probateStatus: "dismissed", family: "Probate" },
  { key: "Probate Closed", shortLabel: "Closed", type: "Probate", probateStatus: "closed", family: "Probate" },
  // Adverse Possession × estate-tag intersections — heirs surfacing on a
  // long-held property under an AP claim is the cleanest specialty deal.
  { key: "Adverse Possession EST OF", shortLabel: "Deceased", type: "Adverse Possession", tag: "EST OF", family: "Adverse Possession" },
  { key: "Adverse Possession EST OF 2nd Owner", shortLabel: "Deceased/2nd Owner", type: "Adverse Possession", tag: "EST OF 2nd Owner", family: "Adverse Possession" },
  { key: "Adverse Possession Possible EST OF", shortLabel: "Possible Deceased", type: "Adverse Possession", tag: "Possible EST OF", family: "Adverse Possession" },
  // Property Liens × estate-tag intersections — lien-burdened estate property
  // where heirs need to clean up title before sale.
  { key: "Prop Liens <$50K EST OF", shortLabel: "Deceased", type: "Property Liens", tag: "EST OF", family: "Prop Liens <$50K", parentFamily: "Property Liens", tier: "<$50K" },
  { key: "Prop Liens <$50K EST OF 2nd Owner", shortLabel: "Deceased/2nd Owner", type: "Property Liens", tag: "EST OF 2nd Owner", family: "Prop Liens <$50K", parentFamily: "Property Liens", tier: "<$50K" },
  { key: "Prop Liens <$50K Possible EST OF", shortLabel: "Possible Deceased", type: "Property Liens", tag: "Possible EST OF", family: "Prop Liens <$50K", parentFamily: "Property Liens", tier: "<$50K" },
  { key: "Prop Liens $50-100K EST OF", shortLabel: "Deceased", type: "Property Liens", tag: "EST OF", family: "Prop Liens $50-100K", parentFamily: "Property Liens", tier: "$50-100K" },
  { key: "Prop Liens $50-100K EST OF 2nd Owner", shortLabel: "Deceased/2nd Owner", type: "Property Liens", tag: "EST OF 2nd Owner", family: "Prop Liens $50-100K", parentFamily: "Property Liens", tier: "$50-100K" },
  { key: "Prop Liens $50-100K Possible EST OF", shortLabel: "Possible Deceased", type: "Property Liens", tag: "Possible EST OF", family: "Prop Liens $50-100K", parentFamily: "Property Liens", tier: "$50-100K" },
  { key: "Prop Liens $100K+ EST OF", shortLabel: "Deceased", type: "Property Liens", tag: "EST OF", family: "Prop Liens $100K+", parentFamily: "Property Liens", tier: "$100K+" },
  { key: "Prop Liens $100K+ EST OF 2nd Owner", shortLabel: "Deceased/2nd Owner", type: "Property Liens", tag: "EST OF 2nd Owner", family: "Prop Liens $100K+", parentFamily: "Property Liens", tier: "$100K+" },
  { key: "Prop Liens $100K+ Possible EST OF", shortLabel: "Possible Deceased", type: "Property Liens", tag: "Possible EST OF", family: "Prop Liens $100K+", parentFamily: "Property Liens", tier: "$100K+" },
  // Federal Tax Liens × estate-tag intersections.
  { key: "Federal Tax Liens EST OF", shortLabel: "Deceased", type: "Federal Tax Liens", tag: "EST OF", family: "Federal Tax Liens", parentFamily: "Federal Tax Liens" },
  { key: "Federal Tax Liens EST OF 2nd Owner", shortLabel: "Deceased/2nd Owner", type: "Federal Tax Liens", tag: "EST OF 2nd Owner", family: "Federal Tax Liens", parentFamily: "Federal Tax Liens" },
  { key: "Federal Tax Liens Possible EST OF", shortLabel: "Possible Deceased", type: "Federal Tax Liens", tag: "Possible EST OF", family: "Federal Tax Liens", parentFamily: "Federal Tax Liens" },
  // Other Liens × estate-tag intersections.
  { key: "Other Liens EST OF", shortLabel: "Deceased", type: "Other Liens", tag: "EST OF", family: "Other Liens", parentFamily: "Other Liens" },
  { key: "Other Liens EST OF 2nd Owner", shortLabel: "Deceased/2nd Owner", type: "Other Liens", tag: "EST OF 2nd Owner", family: "Other Liens", parentFamily: "Other Liens" },
  { key: "Other Liens Possible EST OF", shortLabel: "Possible Deceased", type: "Other Liens", tag: "Possible EST OF", family: "Other Liens", parentFamily: "Other Liens" },
  // Judgments × estate-tag intersections.
  { key: "Judgments EST OF", shortLabel: "Deceased", type: "Judgments", tag: "EST OF", family: "Judgments", parentFamily: "Judgments" },
  { key: "Judgments EST OF 2nd Owner", shortLabel: "Deceased/2nd Owner", type: "Judgments", tag: "EST OF 2nd Owner", family: "Judgments", parentFamily: "Judgments" },
  { key: "Judgments Possible EST OF", shortLabel: "Possible Deceased", type: "Judgments", tag: "Possible EST OF", family: "Judgments", parentFamily: "Judgments" },
];

const TYPE_COLOR = Object.fromEntries(LEAD_TYPES.map((t) => [t.key, t.color]));

// ----------------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------------
const fmtMoney = (v) => `$${(v || 0).toLocaleString()}`;

// Compact currency for column displays where vertical real-estate is tight.
// Returns "$X", "$XK", or "$X.XM" depending on magnitude.
const fmtCompactMoney = (v) => {
  if (v == null || v === 0) return "—";
  const n = Math.abs(v);
  if (n < 1000) return `$${Math.round(v)}`;
  if (n < 1000000) return `$${Math.round(v / 1000)}K`;
  return `$${(v / 1000000).toFixed(1)}M`;
};
const fmtCount = (v) => (v == null ? 0 : v).toLocaleString();

// External-site URL builders. No API keys needed — these are public deep links.
// Miami-Dade Property Appraiser deep link by folio. The PA site is a SPA;
// the folio is passed via the hash fragment to be picked up client-side.
// Always works for any Miami-Dade folio (which every lead in this dashboard
// has, since the jurisdiction filter rejects leads with unrecognized prefixes).
function buildPaUrl(lead) {
  if (!lead.folio) return "https://apps.miamidadepa.gov/propertysearch/";
  return `https://apps.miamidadepa.gov/propertysearch/#/?folio=${lead.folio.replace(/-/g, "")}`;
}

// Unified property web search. Returns a plain Google search URL for the
// address — no site: filter, no quotes. The resulting Google page surfaces
// everything you'd want to look at for a property:
//
//   - Map widget at top with embedded Street View thumbnail (1 click → SV)
//   - Address card with Directions / Share buttons
//   - Zillow as #1 organic result when indexed (1 click → property page)
//   - Other aggregators: Redfin, Trulia, Homes.com, PropertyShark, Realtor.com
//   - County records and news mentions when available
//
// This is the interim consolidated approach until Phase 1 (lat/long) and
// Phase 8.5 (ZPID + panoid caching) ship. Once those land, this single
// helper can be split back into dedicated buildZillowUrl + buildStreetViewUrl
// helpers that each return 1-click direct deep-links to their respective
// canonical property pages. The retained comments in those (now-unused)
// helpers below document exactly what those direct URLs will look like.
//
// Why this is better than the prior dedicated buttons for now:
//   - Zillow button required Google site:zillow.com redirect (2 clicks, plus
//     "no results" for ~half of Miami off-market leads)
//   - Street View button opened Maps requiring pegman-drag (3-4 clicks)
//   - This single button gets the user to both destinations in 2 clicks each,
//     plus surfaces Realtor.com / Redfin / county records as side benefits.
function buildSearchUrl(lead) {
  const fullAddress = `${lead.propertyAddress}, ${lead.propertyCity}`;
  return `https://www.google.com/search?q=${encodeURIComponent(fullAddress)}`;
}

// Retained for documentation — these helpers describe the future direct-deep-link
// URLs that will replace buildSearchUrl once Phase 1 (lat/long on every lead)
// and Phase 8.5 (ZPID + panoid caching) ship. They are currently unused but
// preserved so the upgrade path is documented in code, not just in the
// migration plan.
function buildZillowUrl(lead) {
  // Why we can't link directly to Zillow:
  //
  // Zillow's canonical property URL is /homedetails/{slug}/{zpid}_zpid/ — but
  // ZPID is an internal Zillow identifier, not derivable from address. The
  // public area-search pattern (/homes/{slug}_rb/) is meant for map-bounds
  // searches; in practice it fuzzy-matches to neighborhoods (e.g. routing
  // "13245 SW 88TH ST" to a Gladeview area search instead of the property).
  //
  // Workaround: Google site-restricted search with the street address QUOTED.
  // The quotes force Google to match the exact street number + street name,
  // so we don't get fuzzy matches like "1555 NW 62nd Ter" returned for a
  // search for "1422 NW 62nd St". The city + zip stay unquoted to give
  // Google flexibility on address-formatting variations Zillow may use
  // (e.g. "Miami, FL" vs "Miami FL").
  //
  // Honest trade-off: if the property has no Zillow page at all (common for
  // old off-market Miami-Dade homes), the user sees "no results" — clearer
  // signal than a confidently-wrong neighborhood property.
  //
  // Future enhancement (Phase 8.5 of migration plan): a nightly Playwright
  // scraper does this same Google search per lead, extracts the ZPID from
  // the first result URL, and caches it on lead.zillowZpid. Once cached,
  // this helper returns the direct /homedetails/.../{ZPID}_zpid/ URL —
  // one click instead of two. The Google fallback below remains the
  // honest answer for leads Zillow doesn't have indexed.
  //   if (lead.zillowZpid) {
  //     const slug = `${lead.propertyAddress}-${lead.propertyCity}`.replace(/\s+/g, "-");
  //     return `https://www.zillow.com/homedetails/${slug}/${lead.zillowZpid}_zpid/`;
  //   }
  const streetQuoted = `"${lead.propertyAddress}"`;
  return `https://www.google.com/search?q=${encodeURIComponent(streetQuoted + " " + lead.propertyCity + " site:zillow.com")}`;
}

function buildStreetViewUrl(lead) {
  // Google Maps URLs API requires a LatLng `viewpoint` or a `pano` ID for
  // direct Street View entry — neither of which we have at property
  // granularity yet (seed data doesn't include lat/long). Centering on the
  // zip centroid would open Street View at the WRONG LOCATION (middle of
  // the zip, not the property), which is worse than no link at all.
  //
  // Instead, we open Google Maps at the address. The user clicks the Street
  // View pegman to enter the panorama once Maps has resolved the address.
  // Single shot, correct location, no orphan-coordinate confusion. ~3 clicks
  // total to actually see the property.
  //
  // Future enhancement (Phase 1 + Phase 8.5 of migration plan):
  //   - Phase 1 PA bulk import populates lead.latitude / lead.longitude.
  //     With just those two fields, this helper can return a direct
  //     Street View entry URL (Google picks default heading).
  //   - Phase 8.5 adds a Street View metadata API scraper that caches
  //     lead.streetViewPanoid and lead.streetViewHeading. With those, the
  //     URL points the camera directly at the building façade.
  //
  //   if (lead.latitude && lead.longitude) {
  //     const heading = lead.streetViewHeading ?? 0;
  //     const panoFragment = lead.streetViewPanoid
  //       ? `/data=!3m7!1e1!3m5!1s${lead.streetViewPanoid}!2e0!7i16384!8i8192`
  //       : `/data=!3m1!1e3`;  // generic Street View entry without specific pano
  //     return `https://www.google.com/maps/@${lead.latitude},${lead.longitude},3a,75y,${heading}h,90t${panoFragment}`;
  //   }
  //
  // Current fallback (always works): open Maps centered on the geocoded
  // address. Preserved permanently as the last-resort path even after
  // Phase 8.5 ships.
  const fullAddress = `${lead.propertyAddress}, ${lead.propertyCity}`;
  return `https://www.google.com/maps/place/${encodeURIComponent(fullAddress)}`;
}

// Miami-Dade RealForeclose (Realauction) deep links.
// The platform is run by Realauction.com and each county has its own subdomain.
// When we know the auction case number, we can deep-link directly to the case;
// otherwise we open the auction calendar so the user can search.
function buildRealForecloseUrl(lead) {
  const caseNum = lead.auctionData?.caseNumber;
  // The case-search endpoint accepts a search query. If the case number is
  // present, the page lands on a filtered list with that case. Otherwise we
  // send the user to the calendar search page.
  if (caseNum) {
    return `https://miamidade.realforeclose.com/index.cfm?zaction=AUCTION&Zmethod=PREVIEW&AUCTIONDATE=&searchKey=${encodeURIComponent(caseNum)}`;
  }
  return `https://miamidade.realforeclose.com/index.cfm?zaction=AUCTION&Zmethod=BROWSER`;
}

// Realist (CoreLogic) is gated behind MLS authentication — there is no
// public deep link to a property page since users authenticate through
// their MLS subscription. Land them at the Realist entry point; their
// MLS session resolves them to the right property search interface.
function buildRealistUrl() {
  return `https://realist.corelogic.com/`;
}

// ============================================================================
// CSV IMPORTER INFRASTRUCTURE
// Single component handles imports from multiple sources via column-mapping.
// New sources can be added by extending IMPORT_SCHEMAS.
// ============================================================================

// CSV parser that correctly handles quoted fields containing commas, embedded
// newlines, and escaped quotes. Returns an array of row objects keyed by
// the header row.
function parseCsv(text) {
  if (!text || !text.trim()) return [];
  const rows = [];
  let cur = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  // Strip BOM if present
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ",") { cur.push(field); field = ""; i++; continue; }
    if (ch === "\r") { i++; continue; }
    if (ch === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; i++; continue; }
    field += ch; i++;
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); rows.push(cur); }
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).filter((r) => r.some((c) => c && c.trim())).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] || "").trim(); });
    return obj;
  });
}

// Normalize folio for matching — Miami-Dade folios are 13 digits, sometimes
// stored with dashes (XX-XXXX-XXX-XXXX), sometimes without.
function normalizeFolio(folio) {
  if (!folio) return null;
  const digits = String(folio).replace(/\D/g, "");
  return digits.length >= 13 ? digits.slice(0, 13) : (digits || null);
}

// Format a 13-digit folio in the canonical XX-XXXX-XXX-XXXX form
function formatFolio(folio) {
  const d = normalizeFolio(folio);
  if (!d || d.length !== 13) return folio;
  return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 9)}-${d.slice(9, 13)}`;
}

// Normalize a property address for matching across data sources. MLS exports
// (Matrix) don't include county folios, so address is the natural join key
// when reconciling MLS data with PA-derived leads. The transforms here:
// uppercase, drop punctuation, expand or contract directionals/types so common
// variants ("123 NW 5TH STREET" vs "123 NW 5 ST" vs "123 N.W. 5TH ST.") collapse
// to the same key. Unit/apartment numbers are stripped because the same building
// generates many MLS listings (one per unit) but typically one PA parcel.
function normalizeAddress(addr) {
  if (!addr) return null;
  let s = String(addr).toUpperCase().trim();
  // Drop unit specifiers (APT 5, UNIT B, #401, STE 200, etc.)
  s = s.replace(/\s+(APT|UNIT|STE|SUITE|#)\s*[A-Z0-9-]+/gi, "");
  // Standardize ordinal/cardinal abbreviations and street types
  const abbrev = {
    "STREET": "ST", "AVENUE": "AVE", "BOULEVARD": "BLVD", "DRIVE": "DR",
    "ROAD": "RD", "COURT": "CT", "PLACE": "PL", "TERRACE": "TER",
    "LANE": "LN", "PARKWAY": "PKWY", "HIGHWAY": "HWY", "CIRCLE": "CIR",
    "NORTHWEST": "NW", "NORTHEAST": "NE", "SOUTHWEST": "SW", "SOUTHEAST": "SE",
    "NORTH": "N", "SOUTH": "S", "EAST": "E", "WEST": "W",
  };
  for (const [full, abr] of Object.entries(abbrev)) {
    s = s.replace(new RegExp(`\\b${full}\\b`, "g"), abr);
  }
  // Drop ordinal suffixes on numbers ("5TH" → "5", "23RD" → "23")
  s = s.replace(/(\d+)(ST|ND|RD|TH)\b/g, "$1");
  // Drop punctuation, collapse whitespace
  s = s.replace(/[.,]/g, "").replace(/\s+/g, " ").trim();
  return s || null;
}

// Build a placeholder "Comp Source" lead from an MLS row that didn't match
// any existing pipeline lead. These records:
//   - Are inserted into allLeads so the (future) Comp Tool can query them
//   - Have no folio, so they're filtered out of recognizedLeads → invisible
//     in the main lead table by default. They aren't outreach targets.
//   - Carry MLS-derived fields (mlsId, mlsStatus, list/close prices, beds/baths)
//     so they're useful as comp sources for nearby leads in the same zip.
// In production (post-migration), these would live in a separate `mls_listings`
// lookup table rather than the `leads` table. The shape below mirrors a lead
// closely enough that the React state-update path doesn't need a fork.
function buildCompSourceLead(fields, rowIdx) {
  const addrNorm = normalizeAddress(fields.propertyAddress);
  if (!addrNorm) return null;
  // Stable synthetic ID derived from MLS# or address hash so re-imports of the
  // same row don't create duplicate Comp Source records.
  const idKey = fields.mlsId || addrNorm;
  let hash = 0;
  for (let i = 0; i < idKey.length; i++) hash = (hash * 31 + idKey.charCodeAt(i)) | 0;
  const syntheticId = 900000 + Math.abs(hash) % 99999;
  const closePrice = Number(String(fields.closePrice || "").replace(/[$,]/g, "")) || 0;
  const closeDate  = fields.closeDate || null;
  const listPrice  = Number(String(fields.listPrice || "").replace(/[$,]/g, "")) || 0;
  const status     = String(fields.mlsStatus || "").trim();
  // Map MLS status text to canonical dashboard values
  const canonicalStatus = mapMlsStatus(status);
  return {
    id: syntheticId,
    folio: null, // intentional — Comp Source records have no county folio
    type: "Comp Source",
    score: 0,
    flags: ["MLS Import", "Comp Source"],
    owner: fields.owner || "—",
    propertyAddress: fields.propertyAddress,
    propertyCity: fields.propertyCity || "Miami",
    propertyZip: fields.propertyZip || "",
    mailingAddress: fields.propertyAddress,
    mailingCity: fields.propertyCity || "Miami",
    amount: 0,
    filed: closeDate || fields.listDate || new Date().toISOString().slice(0, 10),
    equity: "—",
    paTotalValue: 0,
    lastSaleDate: closeDate || null,
    lastSalePrice: closePrice || null,
    mlsId: fields.mlsId || null,
    mlsStatus: canonicalStatus,
    mlsListPrice: listPrice || null,
    mlsListDate: fields.listDate || null,
    mlsDaysOnMarket: Number(fields.daysOnMarket) || null,
    soldAt: canonicalStatus === "Sold" ? closeDate : null,
    soldPrice: canonicalStatus === "Sold" ? closePrice : null,
    bedrooms: Number(fields.beds) || null,
    bathrooms: Number(String(fields.baths || "").split("/")[0]) || null,
    livingSqft: Number(String(fields.sqft || "").replace(/,/g, "")) || null,
    yearBuilt: Number(fields.yearBuilt) || null,
    subdivision: fields.subdivision || null,
    mlsListingAgent: fields.listingAgent || null,
    mlsListingAgentPhone: fields.listingAgentPhone || null,
    // Selling agent + buyer financing only populated for Sold records
    // (Active/Pending have no buyer yet). Powers cash-buyer-list outreach.
    mlsSellingAgent: canonicalStatus === "Sold" ? (fields.sellingAgent || null) : null,
    mlsSellingAgentPhone: canonicalStatus === "Sold" ? (fields.sellingAgentPhone || null) : null,
    mlsBuyerFinancing: canonicalStatus === "Sold" ? normalizeBuyerFinancing(fields.buyerFinancing) : null,
    paTags: [],
    importSources: ["mlsExport"],
    lastImportedAt: new Date().toISOString().slice(0, 10),
    inCrm: false,
  };
}

// Map raw MLS status text (varies by board / export source) to the canonical
// values the dashboard's filters and guardrails expect.
function mapMlsStatus(raw) {
  if (!raw) return null;
  const s = String(raw).toLowerCase();
  if (s.includes("active"))    return "Active";
  if (s.includes("pending") || s.includes("contingent")) return "Pending";
  if (s.includes("expired"))   return "Expired";
  if (s.includes("cancel") || s.includes("withdraw")) return "Canceled";
  if (s.includes("closed") || s.includes("sold") || s === "cl") return "Sold";
  if (s.includes("off")) return "Off-Market";
  return null;
}

// Map raw buyer-financing text to canonical categories. Matrix exports vary
// in capitalization and abbreviation across MLSs ("Cash", "CASH", "Cash Sale",
// "Conv", "Conventional", "FHA Loan", etc.). Cash is the strategic flag for
// wholesale cash-buyer-list outreach — cash buyers close in 10-14 days and
// are typically investors, not owner-occupants.
function normalizeBuyerFinancing(raw) {
  if (!raw) return null;
  const s = String(raw).toLowerCase();
  if (s.includes("cash")) return "Cash";
  if (s.includes("conv")) return "Conventional";
  if (s.includes("fha"))  return "FHA";
  if (s.includes("va"))   return "VA";
  if (s.includes("owner") || s.includes("seller")) return "Owner Financing";
  if (s.includes("hard money") || s.includes("private")) return "Private/Hard Money";
  return "Other";
}

// Find the value of a field in a row using a list of likely column names —
// case-insensitive, whitespace-tolerant. First match wins.
function pickColumn(row, candidates) {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const target = candidate.toLowerCase().replace(/[\s_-]+/g, "");
    for (const key of keys) {
      const norm = key.toLowerCase().replace(/[\s_-]+/g, "");
      if (norm === target) return row[key];
    }
  }
  // Fuzzy: any key that CONTAINS any candidate
  for (const candidate of candidates) {
    const target = candidate.toLowerCase().replace(/[\s_-]+/g, "");
    for (const key of keys) {
      const norm = key.toLowerCase().replace(/[\s_-]+/g, "");
      if (norm.includes(target)) return row[key];
    }
  }
  return null;
}

// Schema definitions for the supported import sources. Each schema knows how
// to extract canonical fields from raw CSV rows. Adding a new source = adding
// an entry here.
const IMPORT_SCHEMAS = {
  countyReports: {
    label: "Miami-Dade County Reports (Code Violations)",
    description: "From miamidade.gov/Apps/RER/RegulationSupportWebViewer Reports tool",
    matchKey: "folio",
    allowInsert: false,
    extractRow: (row) => ({
      folio:           pickColumn(row, ["FOLIO", "FOLIO NUMBER", "PARCEL", "PARCELID"]),
      propertyAddress: pickColumn(row, ["ADDRESS", "PROPERTY ADDRESS", "SITE ADDRESS", "LOCATION"]),
      propertyCity:    pickColumn(row, ["CITY", "MUNICIPALITY"]) || "Miami",
      propertyZip:     pickColumn(row, ["ZIP", "ZIP CODE", "POSTAL CODE"]),
      owner:           pickColumn(row, ["OWNER", "OWNER NAME", "OWNERSHIP"]),
      caseNumber:      pickColumn(row, ["CASE", "CASE NUMBER", "CASE NO", "CASE #"]),
      caseType:        pickColumn(row, ["CASE TYPE", "VIOLATION TYPE", "TYPE"]),
      issueDate:       pickColumn(row, ["ISSUE DATE", "OPEN DATE", "DATE OPENED", "OPENED"]),
      status:          pickColumn(row, ["STATUS", "CASE STATUS"]),
      district:        pickColumn(row, ["DISTRICT", "COMMISSION DISTRICT", "COMMISSIONER DISTRICT"]),
      description:     pickColumn(row, ["DESCRIPTION", "VIOLATION", "DETAILS", "NARRATIVE"]),
    }),
  },
  realForeclose: {
    label: "Miami-Dade RealForeclose (Foreclosure / Tax Auctions)",
    description: "From miamidade.realforeclose.com auction calendar export",
    matchKey: "folio",
    allowInsert: false,
    extractRow: (row) => ({
      folio:           pickColumn(row, ["FOLIO", "FOLIO NUMBER", "PARCEL", "PARCELID", "PROPERTY FOLIO"]),
      propertyAddress: pickColumn(row, ["PROPERTY ADDRESS", "ADDRESS", "SITE ADDRESS", "LOCATION"]),
      propertyCity:    pickColumn(row, ["CITY"]) || "Miami",
      propertyZip:     pickColumn(row, ["ZIP", "ZIP CODE"]),
      owner:           pickColumn(row, ["DEFENDANT", "OWNER", "DEFENDANT NAME", "OWNER NAME"]),
      caseNumber:      pickColumn(row, ["CASE", "CASE NUMBER", "CASE NO", "CASE #"]),
      auctionDate:     pickColumn(row, ["AUCTION DATE", "SALE DATE", "AUCTION", "SCHEDULED DATE"]),
      finalJudgment:   pickColumn(row, ["FINAL JUDGMENT", "JUDGMENT AMOUNT", "FJ", "JUDGMENT"]),
      certificateAmount: pickColumn(row, ["CERTIFICATE AMOUNT", "CERT AMT", "OPENING BID", "MIN BID"]),
      plaintiff:       pickColumn(row, ["PLAINTIFF", "PLAINTIFF NAME"]),
      paTotalValue:    pickColumn(row, ["PA TOTAL VALUE", "ASSESSED VALUE", "MARKET VALUE", "JUST VALUE"]),
    }),
  },
  mlsExport: {
    label: "MIAMI MLS Matrix Export",
    description: "Broad MDC export from Matrix — Active, Pending, Expired, Canceled, Sold/Closed",
    // ↓ Distinct from the other two schemas: MLS exports don't include
    // county folios, so we match by normalized property address. Unmatched
    // rows INSERT as Comp Source records (low-priority lead-universe entries)
    // rather than skipping, so they're available for future comp pulls.
    matchKey: "address",
    allowInsert: true,
    extractRow: (row) => ({
      mlsId:           pickColumn(row, ["MLS#", "MLS NUMBER", "MLS NO", "MLSNUMBER", "ML#", "LIST NUMBER"]),
      propertyAddress: pickColumn(row, ["ADDRESS", "PROPERTY ADDRESS", "STREET ADDRESS", "FULL ADDRESS", "LOCATION"]),
      propertyCity:    pickColumn(row, ["CITY", "MUNICIPALITY"]),
      propertyZip:     pickColumn(row, ["ZIP", "ZIP CODE", "POSTAL CODE", "ZIP4"]),
      mlsStatus:       pickColumn(row, ["STATUS", "MLS STATUS", "STATUS CATEGORY", "LISTING STATUS"]),
      listPrice:       pickColumn(row, ["LIST PRICE", "LISTING PRICE", "ORIGINAL LIST PRICE", "LP", "CURRENT LIST PRICE"]),
      listDate:        pickColumn(row, ["LIST DATE", "LISTING DATE", "DATE LISTED", "ON MARKET DATE"]),
      daysOnMarket:    pickColumn(row, ["DOM", "DAYS ON MARKET", "CDOM"]),
      closePrice:      pickColumn(row, ["CLOSED PRICE", "SOLD PRICE", "SALE PRICE", "SP", "SETTLEMENT PRICE"]),
      closeDate:       pickColumn(row, ["CLOSED DATE", "SOLD DATE", "SETTLEMENT DATE", "CLOSING DATE", "SALE DATE"]),
      beds:            pickColumn(row, ["BEDS", "BEDROOMS", "BR", "TOT BR"]),
      baths:           pickColumn(row, ["BATHS", "BATHROOMS", "BA", "TOTAL BATHS", "TOT BA", "FULL BATHS"]),
      sqft:            pickColumn(row, ["SQFT", "LIVING AREA", "LIVAREA", "LIVING SQFT", "SQFT LIV", "ABV GR LIV AREA"]),
      yearBuilt:       pickColumn(row, ["YEAR BUILT", "YRBLT", "YEAR_BUILT", "YR BUILT"]),
      subdivision:     pickColumn(row, ["SUBDIVISION", "COMMUNITY", "DEVELOPMENT", "SUBDIVISION NAME"]),
      owner:           pickColumn(row, ["OWNER", "OWNER NAME", "SELLER", "SELLER NAME"]),
      // Listing agent direct contact — Matrix exports the listing agent and broker as
      // separate fields. We capture the AGENT'S DIRECT CONTACT (name + phone)
      // because that's who's actually handling the listing and who you'd talk
      // to about an offer. We intentionally do NOT pull "Broker Phone" or
      // "Listing Office Phone" — those route through brokerage front desks and
      // dilute the direct line. The phone column pick is conservative: it has
      // to be obviously an agent phone, not a broker/office phone.
      listingAgent:      pickColumn(row, ["LA NAME", "LIST AGENT NAME", "LIST AGENT", "LISTING AGENT", "AGENT NAME", "LISTING AGENT NAME"]),
      listingAgentPhone: pickColumn(row, ["LA PHONE", "LIST AGENT PHONE", "LIST AGENT CELL", "LISTING AGENT PHONE", "LA CELL", "AGENT PHONE", "AGENT CELL", "LIST AGENT DIRECT"]),
      // Selling agent / buyer's agent direct contact — populated on CLOSED rows
      // only. This is the agent who represented the BUYER on the closed sale.
      // Strategic use: cash-buyer-list outreach. When you have a property under
      // contract and need an end buyer, recent cash-sale records identify
      // investors who buy in your geo; their agents are the warm intro path
      // when you can't reach the buyer directly. Same broker-phone exclusion
      // policy as listing agent.
      sellingAgent:      pickColumn(row, ["SA NAME", "SELLING AGENT NAME", "SELLING AGENT", "SS NAME", "BUYER AGENT", "BUYER AGENT NAME", "BUYER'S AGENT", "BUYERS AGENT"]),
      sellingAgentPhone: pickColumn(row, ["SA PHONE", "SELLING AGENT PHONE", "SELLING AGENT CELL", "SA CELL", "BUYER AGENT PHONE", "BUYER AGENT CELL", "SS PHONE", "BUYER'S AGENT PHONE"]),
      // Buyer financing — Cash vs Conventional vs FHA etc. Cash sales are the
      // prime cash-buyer-list targets (those buyers can close in 10-14 days
      // and are typically investors, not owner-occupants).
      buyerFinancing:    pickColumn(row, ["BUYER FINANCING", "FINANCING", "SALE FINANCING", "TERMS", "TERMS OF SALE", "BUYER FIN"]),
    }),
  },
  ghlContactRefresh: {
    label: "GHL Contact Refresh",
    description: "Match GHL contacts by folio → download MLS-update CSV for re-import",
    // Reverse-direction flow vs. the other schemas: instead of enriching the
    // dashboard with external data, this reads CRM contacts and produces a
    // CSV the user re-imports to GHL to push current MLS / sold status back.
    matchKey: "folio",
    allowInsert: false,
    isGhlRefresh: true,
    extractRow: (row) => ({
      contactId:       pickColumn(row, ["CONTACT ID", "ID", "CONTACT_ID", "GHL ID", "GHL_ID", "GHL CONTACT ID"]),
      folio:           pickColumn(row, ["FOLIO", "FOLIO NUMBER", "PARCEL", "PARCEL ID", "PARCELID", "PROPERTY FOLIO"]),
      firstName:       pickColumn(row, ["FIRST NAME", "FIRSTNAME", "FNAME"]),
      lastName:        pickColumn(row, ["LAST NAME", "LASTNAME", "LNAME"]),
      propertyAddress: pickColumn(row, ["ADDRESS", "PROPERTY ADDRESS", "STREET ADDRESS", "ADDRESS 1", "ADDRESS1"]),
      propertyCity:    pickColumn(row, ["CITY"]),
      phone:           pickColumn(row, ["PHONE", "PHONE NUMBER", "PRIMARY PHONE", "MOBILE", "CELL", "PHONE PRIMARY"]),
      email:           pickColumn(row, ["EMAIL", "EMAIL ADDRESS", "PRIMARY EMAIL"]),
    }),
  },
};

// Try to auto-detect which schema a CSV matches based on its column headers
function detectImportSchema(headers) {
  const lower = headers.map((h) => h.toLowerCase());
  const has = (s) => lower.some((h) => h.includes(s));
  // GHL contact export: Contact ID + Folio is the strongest tell. We check
  // this BEFORE MLS / county schemas so the case-fallback below doesn't
  // claim CRM files that happen to also have address/city columns.
  if ((has("contact id") || has("contact_id") || has("ghl id")) && has("folio")) return "ghlContactRefresh";
  // MLS Matrix export: MLS# column + status + list price is the strongest tell
  if ((has("mls#") || has("mls number") || has("mls no") || has("listing number") || has("ml#")) &&
      (has("list price") || has("status") || has("dom"))) return "mlsExport";
  // RealForeclose: presence of a judgment / auction date column is the tell
  if (has("judgment") || has("auction") || has("plaintiff") || has("defendant")) return "realForeclose";
  // County Reports: case type + case number + folio is the tell
  if ((has("case type") || has("case number") || has("case no")) && has("folio")) return "countyReports";
  // Generic fallback — assume County Reports if there's any case# column
  if (has("case")) return "countyReports";
  return null;
}

// Apply an import: walk parsed rows, dedupe against existing leads, and produce
// both ENRICHMENTS (updates to existing leads) and INSERTS (new lead records,
// for schemas like mlsExport that allow it). The schema's matchKey controls
// whether matching is by folio (county sources) or normalized address (MLS).
// Returns: { stats, updates, inserts }
function applyImport(parsedRows, schemaKey, existingLeads, currentApiConfig) {
  const schema = IMPORT_SCHEMAS[schemaKey];
  if (!schema) return { error: "Unknown import schema" };
  const stats = { enriched: 0, inserted: 0, skipped: 0, skippedReasons: [] };

  // Build both indexes — folio-keyed (county sources) and address-keyed (MLS).
  // Pre-computing both is cheap (O(n) once) and avoids special-casing later.
  const leadsByFolio = new Map();
  const leadsByAddress = new Map();
  existingLeads.forEach((l) => {
    const folioNorm = normalizeFolio(l.folio);
    if (folioNorm) leadsByFolio.set(folioNorm, l);
    const addrNorm = normalizeAddress(l.propertyAddress);
    if (addrNorm) leadsByAddress.set(addrNorm, l);
  });
  const updates = []; // { type: "enrich", folioNorm | addrNorm, enrichments }
  const inserts = []; // [ { full lead object }... ] — only for schemas with allowInsert
  // Track addresses inserted in THIS run so duplicates within one CSV don't
  // create multiple Comp Source records.
  const insertedAddresses = new Set();

  parsedRows.forEach((rawRow, rowIdx) => {
    const fields = schema.extractRow(rawRow);

    // Determine match key & lookup based on the schema's matching strategy
    let existing, matchDisplay;
    if (schema.matchKey === "address") {
      const addrNorm = normalizeAddress(fields.propertyAddress);
      if (!addrNorm) {
        stats.skipped++;
        stats.skippedReasons.push(`Row ${rowIdx + 2}: missing or invalid property address`);
        return;
      }
      existing = leadsByAddress.get(addrNorm);
      matchDisplay = fields.propertyAddress;
      // Track the normalized address so duplicates in this CSV don't double-insert
      if (!existing && insertedAddresses.has(addrNorm)) {
        stats.skipped++;
        stats.skippedReasons.push(`Row ${rowIdx + 2}: duplicate address in this import`);
        return;
      }
    } else {
      const folioNorm = normalizeFolio(fields.folio);
      if (!folioNorm) {
        stats.skipped++;
        stats.skippedReasons.push(`Row ${rowIdx + 2}: missing or invalid folio`);
        return;
      }
      existing = leadsByFolio.get(folioNorm);
      matchDisplay = formatFolio(folioNorm);
    }

    if (existing) {
      // ENRICH path — apply the data to the existing lead
      stats.enriched++;
      const enrichments = {};
      if (schemaKey === "countyReports") {
        // Build a violation record and add to codeViolationsSummary.byCategory
        const violation = {
          caseNumber: fields.caseNumber,
          type: fields.caseType,
          description: fields.description,
          status: fields.status,
          issueDate: fields.issueDate,
          fine: 0,
          raw: rawRow,
        };
        // HARD SKIP: Inspection Rejected violations don't enrich anything
        if (shouldSkipViolation(violation)) {
          stats.enriched--; // back out the increment we made
          stats.skipped++;
          stats.skippedReasons.push(`Row ${rowIdx + 2}: status "Inspection Rejected" — skipped by rule`);
          return;
        }
        const tagKeys = classifyViolationTags(violation);
        const isActive = isViolationActive(violation, currentApiConfig);
        const prevCV = existing.codeViolationsSummary || { count: 0, activeCount: 0, totalFines: 0, byCategory: {}, activeCategories: [], scoreBoost: 0 };
        const newByCategory = { ...prevCV.byCategory };
        // Add the violation to EVERY matching tag bucket (multi-tag mode)
        for (const tagKey of tagKeys) {
          if (!newByCategory[tagKey]) newByCategory[tagKey] = { active: 0, resolved: 0, totalFines: 0, items: [] };
          // Avoid double-adding the same case number to the same bucket
          const alreadyHave = newByCategory[tagKey].items.some((it) => it.caseNumber && it.caseNumber === violation.caseNumber);
          if (!alreadyHave) {
            newByCategory[tagKey].items.push({ ...violation, _categoryKey: tagKey, _isActive: isActive });
            if (isActive) newByCategory[tagKey].active++; else newByCategory[tagKey].resolved++;
          }
        }
        const newActiveCategories = Object.keys(newByCategory).filter((k) => newByCategory[k].active > 0);
        const newScoreBoost = Math.min(30, newActiveCategories.reduce((s, k) => {
          const c = VIOLATION_CATEGORIES.find((cc) => cc.key === k);
          return s + (c?.scoreBoost || 0);
        }, 0));
        // Don't double-count violations across multiple tag buckets in totals — count unique items by case number
        const uniqueByCase = new Set();
        let activeUnique = 0, totalUnique = 0;
        for (const k of Object.keys(newByCategory)) {
          for (const it of newByCategory[k].items) {
            const id = it.caseNumber || `${it.type}-${it.issueDate}`;
            if (uniqueByCase.has(id)) continue;
            uniqueByCase.add(id);
            totalUnique++;
            if (it._isActive) activeUnique++;
          }
        }
        enrichments.codeViolationsSummary = {
          count: totalUnique,
          activeCount: activeUnique,
          totalFines: Object.values(newByCategory).reduce((s, b) => s + b.totalFines, 0),
          byCategory: newByCategory,
          activeCategories: newActiveCategories,
          scoreBoost: newScoreBoost,
          lastFetched: new Date().toISOString(),
          source: "Imported (County Reports)",
        };
        const newFlags = existing.flags.includes("Code Violations") ? existing.flags : [...existing.flags, "Code Violations"];
        enrichments.flags = newFlags;
        // Recompute score: strip prior boost, apply new
        enrichments.score = Math.min(100, (existing.score - (prevCV.scoreBoost || 0)) + newScoreBoost);
      } else if (schemaKey === "realForeclose") {
        // Apply or update auction data
        enrichments.auctionData = {
          ...(existing.auctionData || {}),
          finalJudgment: Number(String(fields.finalJudgment).replace(/[$,]/g, "")) || existing.auctionData?.finalJudgment || 0,
          certificateAmount: Number(String(fields.certificateAmount).replace(/[$,]/g, "")) || existing.auctionData?.certificateAmount || 0,
          auctionDate: fields.auctionDate || existing.auctionData?.auctionDate,
          plaintiff: fields.plaintiff || existing.auctionData?.plaintiff,
          caseNumber: fields.caseNumber || existing.auctionData?.caseNumber,
          paTotalValue: Number(String(fields.paTotalValue).replace(/[$,]/g, "")) || existing.auctionData?.paTotalValue || 0,
          source: "RealForeclose",
          importedAt: new Date().toISOString().slice(0, 10),
        };
        // Recompute verdict
        const verdict = computeEquityVerdict(enrichments.auctionData);
        if (verdict) enrichments.auctionData = { ...enrichments.auctionData, ...verdict };
      } else if (schemaKey === "mlsExport") {
        // Apply MLS-derived enrichment to the existing lead. Updates the
        // dashboard's MLS Status field (which drives the outreach guardrail
        // and the Sold/Closed state for ARV references).
        //
        // ───────────────────────────────────────────────────────────────────
        // FUTURE STRATEGY (not currently active) — LONG-DOM ACTIVE WATCHLIST
        // ───────────────────────────────────────────────────────────────────
        // Current policy: don't outreach to Active/Pending leads (MLS guardrail
        // blocks them, default view hides them). This is correct conservative
        // behavior for our current Off-Market-only operation.
        //
        // Planned future strategy: long-DOM Active listings (≥ 120 days on
        // market) are a strong title-distress signal — many of these are stuck
        // not because of price but because of an uncurable defect (unrecorded
        // heir deed, missing spouse signature, unopened estate, LE/REM
        // objection, etc.) that the listing agent doesn't realize they can't
        // fix. When the listing finally dies, we want to be the first call.
        //
        // To enable that strategy, three things will be added (not now):
        //   1. DOM-based score boost for Active leads (currently DOM is captured
        //      but not scored). Long-DOM + estate signal + multi-owner mismatch
        //      = highest-confidence title-distress candidate.
        //   2. "Title-Distress Watchlist" filter view — Active/Pending leads
        //      with DOM ≥ 120 AND distress signals stacked. Separate from
        //      active outreach pipeline; just a watch queue.
        //   3. Status-transition alerts — when a watchlist lead flips from
        //      Active → Expired/Canceled, fire a notification. That's the
        //      "outreach window just opened" moment.
        //
        // The architecture supports all three already. They're not built
        // because they're not needed yet, but the data feeding them (mlsStatus,
        // mlsDaysOnMarket, mlsListingAgent, mlsListingAgentPhone) is captured
        // on every import for when the strategy turns on. Capturing it now
        // means historical DOM trends are available later — you can't go back
        // and reconstruct DOM for a listing that's already expired.
        // ───────────────────────────────────────────────────────────────────
        const canonicalStatus = mapMlsStatus(fields.mlsStatus);
        const closePrice = Number(String(fields.closePrice || "").replace(/[$,]/g, "")) || 0;
        const listPrice  = Number(String(fields.listPrice || "").replace(/[$,]/g, "")) || 0;
        if (canonicalStatus) enrichments.mlsStatus = canonicalStatus;
        if (fields.mlsId) enrichments.mlsId = fields.mlsId;
        if (listPrice) enrichments.mlsListPrice = listPrice;
        if (fields.listDate) enrichments.mlsListDate = fields.listDate;
        if (fields.daysOnMarket) enrichments.mlsDaysOnMarket = Number(fields.daysOnMarket);
        // Listing agent direct contact — agent phone, NOT broker phone (see
        // schema definition for the rationale on which columns we pull from).
        if (fields.listingAgent) enrichments.mlsListingAgent = fields.listingAgent;
        if (fields.listingAgentPhone) enrichments.mlsListingAgentPhone = fields.listingAgentPhone;
        // Closed/Sold listings update soldAt/soldPrice for ARV cross-reference,
        // PLUS capture selling agent + buyer financing for cash-buyer-list strategy.
        if (canonicalStatus === "Sold" && closePrice && fields.closeDate) {
          enrichments.soldAt = fields.closeDate;
          enrichments.soldPrice = closePrice;
          // Selling agent (the buyer's agent) — secondary outreach path when
          // the cash buyer isn't directly reachable. These fields are only
          // meaningful on Sold rows; Active/Pending/Expired have no buyer yet.
          if (fields.sellingAgent) enrichments.mlsSellingAgent = fields.sellingAgent;
          if (fields.sellingAgentPhone) enrichments.mlsSellingAgentPhone = fields.sellingAgentPhone;
          // Buyer financing — normalize to canonical values for clean filtering.
          // "Cash" is the high-value flag for wholesale cash-buyer-list purposes.
          if (fields.buyerFinancing) {
            enrichments.mlsBuyerFinancing = normalizeBuyerFinancing(fields.buyerFinancing);
          }
        }
        // outreachBlocked follows MLS status — Active/Pending blocks outreach
        if (canonicalStatus === "Active" || canonicalStatus === "Pending") {
          enrichments.outreachBlocked = true;
        } else if (canonicalStatus && canonicalStatus !== "Off-Market") {
          // Expired/Canceled/Sold — explicitly clear the block (was previously set by stale data)
          enrichments.outreachBlocked = false;
        }
      }
      // Track which sources have enriched this lead (for the Import Source filter)
      const prevSources = Array.isArray(existing.importSources) ? existing.importSources : [];
      enrichments.importSources = prevSources.includes(schemaKey) ? prevSources : [...prevSources, schemaKey];
      enrichments.lastImportedAt = new Date().toISOString().slice(0, 10);
      const matchKeyValue = schema.matchKey === "address"
        ? normalizeAddress(fields.propertyAddress)
        : normalizeFolio(fields.folio);
      updates.push({ type: "enrich", matchKey: matchKeyValue, byField: schema.matchKey || "folio", enrichments });
    } else if (schema.allowInsert) {
      // INSERT path — schema permits creating new lead records for unmatched rows
      const newLead = buildCompSourceLead(fields, rowIdx);
      if (!newLead) {
        stats.skipped++;
        stats.skippedReasons.push(`Row ${rowIdx + 2}: insufficient data to insert (missing address)`);
        return;
      }
      inserts.push(newLead);
      insertedAddresses.add(normalizeAddress(fields.propertyAddress));
      stats.inserted++;
    } else {
      // SKIP path — folio not in pipeline, schema doesn't allow inserts (enrich-only)
      stats.skipped++;
      const addr = fields.propertyAddress ? ` · ${fields.propertyAddress}` : "";
      const owner = fields.owner ? ` · ${fields.owner}` : "";
      stats.skippedReasons.push(`Row ${rowIdx + 2}: ${matchDisplay} not in pipeline${addr}${owner}`);
    }
  });

  return { stats, updates, inserts };
}

// CRM REFRESH (REVERSE-DIRECTION IMPORT)
// Reads a GHL contact export CSV and produces an output CSV the user can
// re-import to GHL to push current dashboard knowledge (MLS status, sold
// status, listing agent, DOM, etc.) back into the CRM. This is how the
// pipeline-to-CRM data flow closes the loop for stale contacts.
//
// Match strategy: folio (exact). User confirmed folio is stored as a GHL
// custom field, so address fallback isn't needed yet.
//
// Returns {
//   stats:         { matched, unmatched, byAction, unmatchedReasons },
//   reportRows:    array of objects ready for the existing downloadCsv helper
//   matchedLeadIds: array of lead IDs that matched — parent uses these to
//                  mark leads as inCrm=true after the user downloads.
// }
function processGhlRefresh(parsedRows, existingLeads) {
  const schema = IMPORT_SCHEMAS.ghlContactRefresh;
  const stats = {
    matched: 0,
    unmatched: 0,
    byAction: {
      // Action categories — drive the preview UI and the suggested tags
      // in the output CSV. Each row maps to exactly one bucket.
      nowSold:           0, // Has soldAt set (closed sale) — close opportunity
      nowActive:         0, // mlsStatus === "Active" — don't call
      nowPending:        0, // mlsStatus === "Pending" — monitor for fall-through
      nowExpired:        0, // mlsStatus === "Expired" — outreach unlocked
      nowCanceled:       0, // mlsStatus === "Canceled" — outreach unlocked
      nowCameBack:       0, // mlsStatus === "Came Back" — pending fell through
      stillOffMarket:    0, // Off-Market / unknown — no change
    },
    unmatchedReasons: [],
  };

  // Build folio → lead lookup once
  const leadsByFolio = new Map();
  existingLeads.forEach((l) => {
    const folioNorm = normalizeFolio(l.folio);
    if (folioNorm) leadsByFolio.set(folioNorm, l);
  });

  const reportRows = [];
  const matchedLeadIds = [];

  parsedRows.forEach((rawRow, idx) => {
    const fields = schema.extractRow(rawRow);
    if (!fields.contactId) {
      stats.unmatched++;
      stats.unmatchedReasons.push(`Row ${idx + 2}: missing Contact ID`);
      return;
    }
    const folioNorm = normalizeFolio(fields.folio);
    if (!folioNorm) {
      stats.unmatched++;
      stats.unmatchedReasons.push(`Row ${idx + 2}: contact ${fields.contactId} — missing or invalid folio`);
      return;
    }
    const lead = leadsByFolio.get(folioNorm);
    if (!lead) {
      stats.unmatched++;
      stats.unmatchedReasons.push(`Row ${idx + 2}: contact ${fields.contactId} — folio ${formatFolio(folioNorm)} not in dashboard pipeline`);
      return;
    }

    stats.matched++;
    matchedLeadIds.push(lead.id);

    // Classify into one action bucket. Order matters: soldAt takes precedence
    // over mlsStatus because a Sold lead can still have mlsStatus = "Sold" in
    // the data but the close has already happened.
    let action;
    if (lead.soldAt) action = "nowSold";
    else if (lead.mlsStatus === "Active")    action = "nowActive";
    else if (lead.mlsStatus === "Pending")   action = "nowPending";
    else if (lead.mlsStatus === "Expired")   action = "nowExpired";
    else if (lead.mlsStatus === "Canceled")  action = "nowCanceled";
    else if (lead.mlsStatus === "Came Back") action = "nowCameBack";
    else action = "stillOffMarket";
    stats.byAction[action]++;

    // Build the output row for the GHL re-import CSV. Column names match
    // the same custom-field shape used in the main GHL CSV Export feature
    // so existing GHL field mappings keep working.
    const doNotCall = action === "nowActive" || action === "nowPending";
    const tags = [];
    if (doNotCall) tags.push("DO_NOT_CALL_ACTIVE_MLS");
    if (action === "nowSold") tags.push("SOLD");
    if (action === "nowExpired" || action === "nowCanceled") tags.push("OUTREACH_UNLOCKED");
    if (action === "nowCameBack") tags.push("MLS_CAME_BACK");
    // Build a human-readable update reason so the GHL contact's activity
    // log shows WHY the update happened, not just opaque field changes.
    let updateReason;
    if (action === "nowSold") {
      const priceStr = lead.soldPrice ? ` for $${Number(lead.soldPrice).toLocaleString()}` : "";
      updateReason = `Closed sale on ${lead.soldAt}${priceStr} — close opportunity`;
    } else if (action === "nowActive") {
      const domStr = lead.mlsDaysOnMarket ? ` (${lead.mlsDaysOnMarket}d on market)` : "";
      updateReason = `Now MLS Active${domStr} — outreach blocked, listing agent has the relationship`;
    } else if (action === "nowPending") {
      updateReason = "Now MLS Pending — under contract, monitor for fall-through";
    } else if (action === "nowExpired") {
      updateReason = "MLS listing expired — outreach unlocked";
    } else if (action === "nowCanceled") {
      updateReason = "MLS listing canceled — outreach unlocked";
    } else if (action === "nowCameBack") {
      updateReason = "Pending fell through — back to Active on MLS";
    } else {
      updateReason = "Still off-market — no MLS-status change";
    }

    reportRows.push({
      "Contact ID":              fields.contactId,
      "Folio":                   lead.folio,
      "Property Address":        lead.propertyAddress,
      "Property City":           lead.propertyCity || "",
      "MLS Status":              lead.mlsStatus || "Off-Market",
      "MLS List Price":          lead.mlsListPrice || "",
      "MLS List Date":           lead.mlsListDate || "",
      "MLS DOM":                 lead.mlsDaysOnMarket || "",
      "MLS Listing Agent":       lead.mlsListingAgent || "",
      "MLS Listing Agent Phone": lead.mlsListingAgentPhone || "",
      "Sold Date":               lead.soldAt || "",
      "Sold Price":              lead.soldPrice || "",
      "Buyer Financing":         lead.mlsBuyerFinancing || "",
      "Do Not Call":             doNotCall ? "TRUE" : "FALSE",
      "Update Reason":           updateReason,
      "Tags to Apply":           tags.join(", "),
      "Last Synced At":          new Date().toISOString(),
    });
  });

  return { stats, reportRows, matchedLeadIds };
}

function downloadCsv(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    const s = val == null ? "" : String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------------------
// COMPONENT
// ----------------------------------------------------------------------------
export default function MiamiDadePropertyIntel() {
  const [allLeads, setAllLeads] = useState(() => allLeadsWithEquityApprox.map(legacyToNewShape));

  // ─────────────────────────────────────────────────────────────────────────────
  // LIVE DATA FETCH — replaces seed data with scraped data when available.
  // On mount, fetches data.json (written by scrapers + committed to git).
  // - If found and has leads: replaces React state with scraped data.
  // - If not found / empty / errors: keeps seed data as graceful fallback.
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const base = import.meta.env.BASE_URL || "/";
    fetch(base + "data.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.leads) && d.leads.length > 0) {
          // Defensive normalization: ensure every lead has the array fields
          // the dashboard expects, defaulting to empty arrays if missing.
          // One fix point, multiple safety nets — prevents crashes on
          // partial data from scrapers or imports.
          const normalized = d.leads.map((lead) => {
            // Step 2: convert legacy shape (type, estateTag, probateStatus) to
            // new shape (listTypes, liens, previousListTypes). Idempotent —
            // already-new-shape leads pass through unchanged.
            const shaped = legacyToNewShape(lead);
            return {
              ...shaped,
              flags: Array.isArray(shaped.flags) ? shaped.flags : [],
              paTags: Array.isArray(shaped.paTags) ? shaped.paTags : [],
              conditionTags: Array.isArray(shaped.conditionTags) ? shaped.conditionTags : [],
              listTypes: Array.isArray(shaped.listTypes) ? shaped.listTypes : [],
              previousListTypes: Array.isArray(shaped.previousListTypes) ? shaped.previousListTypes : [],
              liens: Array.isArray(shaped.liens) ? shaped.liens : [],
            };
          });
          setAllLeads(normalized);
        }
      })
      .catch(() => {});
  }, []);

  // STRICT JURISDICTION ENFORCEMENT
  // The dashboard only displays leads whose folio prefix is in the authoritative
  // FOLIO_PREFIX_TO_MUNICIPALITY table — i.e. cities the user actually works.
  // Any other lead is silently rejected: invisible in the table, not counted
  // in any sidebar tally, not exported, not surfaced in alerts. This shouldn't
  // ever happen with clean PA-site data, but the filter exists as a safety
  // floor so unknown-prefix leads never sneak into operational decisions.
  // `allLeads` remains the underlying state (used by setAllLeads mutations);
  // `recognizedLeads` is the display-layer source of truth.
  const recognizedLeads = useMemo(
    () => allLeads.filter((l) => !!FOLIO_PREFIX_TO_MUNICIPALITY[folioPrefix(l.folio)]),
    [allLeads]
  );
  const [codeViolationsApi, setCodeViolationsApi] = useState(DEFAULT_CODE_VIOLATIONS_API);
  const [codeViolationsCache, setCodeViolationsCache] = useState({}); // { folio: { violations, error } }
  const [codeViolationsFilter, setCodeViolationsFilter] = useState(false);
  const [violationCategoryFilter, setViolationCategoryFilter] = useState(null);
  const [importSourceFilter, setImportSourceFilter] = useState(null); // schemaKey or null
  const updateCodeViolationsCache = useCallback((folio, result) => {
    const folioNorm = normalizeFolio(folio) || folio;
    setCodeViolationsCache((prev) => ({ ...prev, [folioNorm]: result }));
    if (result.violations && result.violations.length > 0) {
      const summary = summarizeViolations(result.violations, codeViolationsApi);
      const totalActive = Object.values(summary.byCategory).reduce((s, b) => s + b.active, 0);
      const totalAll = Object.values(summary.byCategory).reduce((s, b) => s + b.active + b.resolved, 0);
      const totalFines = Object.values(summary.byCategory).reduce((s, b) => s + b.totalFines, 0);

      // Build a flat list of category keys present (active only) for filter/badge use
      const activeCategories = Object.keys(summary.byCategory).filter((k) => summary.byCategory[k].active > 0 && k !== "OTHER");

      setAllLeads((prevLeads) => prevLeads.map((l) => {
        // Match by normalized folio so dashed and undashed forms align
        if (normalizeFolio(l.folio) !== folioNorm) return l;
        const alreadyTagged = l.flags.includes("Code Violations");
        return {
          ...l,
          codeViolationsSummary: {
            count: totalAll,
            activeCount: totalActive,
            totalFines,
            byCategory: summary.byCategory,
            activeCategories,
            scoreBoost: summary.scoreBoost,
            lastFetched: new Date().toISOString(),
          },
          flags: alreadyTagged || totalActive === 0 ? l.flags : [...l.flags, "Code Violations"],
          score: alreadyTagged || totalActive === 0 ? l.score : Math.min(100, l.score + summary.scoreBoost),
        };
      }));
    }
  }, [codeViolationsApi]);
  const [allDeeds] = useState(seedDeedsBase);
  const [jurisdictionFilter, setJurisdictionFilter] = useState("All");
  // Filter state. Arrays for multi-selectable dimensions; empty array means
  // "no filter on this dimension". Sidebar clicks REPLACE (one value at a time);
  // the modal Stack Filters panel TOGGLES (compose multi-value sets).
  const [activeType, setActiveType] = useState([]);  // array of lead-type keys
  const [typeTagIntersection, setTypeTagIntersection] = useState(null); // { type, tag } | null — single-value drill-down
  const [conditionTagFilter, setConditionTagFilter] = useState(null);
  const [scoreFilter, setScoreFilter] = useState([]);
  const [mlsFilter, setMlsFilter] = useState([]);
  // "Active DOM 90+" filter — surfaces Active MLS listings stale 90+ days,
  // statistically the cohort most likely to flip to Expired soon. Mutually
  // exclusive with the regular mlsFilter (both live in the MLS STATUS section).
  const [activeDomFilter, setActiveDomFilter] = useState(false);
  const [ownerStatusFilter, setOwnerStatusFilter] = useState([]);
  const [paTagFilter, setPaTagFilter] = useState([]);
  const [absenteeFilter, setAbsenteeFilter] = useState([]);
  const [possiblePiFilter, setPossiblePiFilter] = useState(false);
  const [possiblePaceFilter, setPossiblePaceFilter] = useState(false);
  const [reverseMortgageFilter, setReverseMortgageFilter] = useState(false);
  const [verdictFilter, setVerdictFilter] = useState("All"); // PURSUE / PASS / All — single-value (exclusive verdict)
  const [auctionUrgencyFilter, setAuctionUrgencyFilter] = useState([]); // array of 'lte30' | '31to60' | 'gte61'

  // Helper: toggle a value's membership in an array-based filter state.
  // Used by the modal Stack Filters chips so each click adds/removes one value.
  const toggleArrFilter = (setter, value) => {
    setter((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);
  };
  // When set, filters to leads matching BOTH a specific type AND a specific tag
  // (e.g. type="Tax Deed" AND estateTag="EST OF"). Cleared whenever the user
  // clicks a regular type filter or "All".
  // (Note: typeTagIntersection, conditionTagFilter, score/mls/owner/pa/absentee
  // filters, possiblePi/Pace/ReverseMortgage flags, verdictFilter, and
  // auctionUrgencyFilter are now declared together at the top of this state
  // block — see "Filter state" comment above.)
  // Cross-family auction outcome filter — matches lead.auctionData.outcome
  // regardless of which auction family the lead came from.
  const [auctionOutcomeFilter, setAuctionOutcomeFilter] = useState(null); // 'cancelled_bk' | 'cancelled_county' | 'buyer_walked' | 'redeemed' | 'sold' | null
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  // Stat-card driven quick filter. When set, narrows the leads table to just
  // the leads matching that card's category. null = no quick filter active.
  // Categories: "hotToCall", "auctionsImminent", "auctions31to60", "newThisWeek",
  // "notInCrm", "newMlsActive".
  const [quickFilter, setQuickFilter] = useState(null);
  const handleQuickFilter = (key) => {
    // Toggle behavior: click the active card to clear; click a different card
    // to switch. Search bar and sidebar filters keep their state independently
    // and stack with this filter.
    setQuickFilter(quickFilter === key ? null : key);
  };
  // Column-header sort handler. Clicking the active column toggles direction;
  // clicking a different column switches to it with a column-appropriate
  // default direction (numeric/date desc, text asc).
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      // Numeric/date fields default to descending (highest/newest first is
      // usually most useful). Text fields default to ascending (A-Z).
      const descByDefault = ["score", "badConditionScore", "stackCount", "amount", "equityApproxAmount", "filed", "inCrm"];
      setSortDir(descByDefault.includes(field) ? "desc" : "asc");
    }
  };
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showCompTool, setShowCompTool] = useState(false);
  const [arvFromComps, setArvFromComps] = useState(null);
  const [showImportInfo, setShowImportInfo] = useState(false);
  const [viewMode, setViewMode] = useState("active"); // "active" | "sold"
  const [alerts, setAlerts] = useState(seedAlertsBase);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [alertPrefs, setAlertPrefs] = useState({
    outreach_unlocked:        { inApp: true,  ghl: true,  slack: true,  email: true,  sms: false },
    came_back_to_market:      { inApp: true,  ghl: false, slack: false, email: false, sms: false },
    new_lis_pendens:          { inApp: true,  ghl: true,  slack: false, email: true,  sms: false },
    tax_deed_filed:           { inApp: true,  ghl: true,  slack: true,  email: true,  sms: true  },
    code_lien_recorded:       { inApp: true,  ghl: false, slack: false, email: false, sms: false },
    deed_recorded:            { inApp: true,  ghl: true,  slack: false, email: true,  sms: false },
    score_threshold_crossed:  { inApp: true,  ghl: false, slack: true,  email: false, sms: false },
  });
  const [quietHours, setQuietHours] = useState({ enabled: true, start: 21, end: 7 });
  const [showGhlSettings, setShowGhlSettings] = useState(false);
  const [showCodeViolationsApi, setShowCodeViolationsApi] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [ghlWebhooks, setGhlWebhooks] = useState({
    // One webhook URL per event type. Empty string = not connected for that type.
    // In production these persist to your backend / localStorage.
    outreach_unlocked: "",
    came_back_to_market: "",
    new_lis_pendens: "",
    tax_deed_filed: "",
    code_lien_recorded: "",
    deed_recorded: "",
    score_threshold_crossed: "",
    // Bulk export: when the user clicks "GHL CSV", optionally also POST each
    // lead to this workflow URL to create contacts in real time.
    bulk_export: "",
  });
  const [ghlActivity, setGhlActivity] = useState([]); // audit log of webhook POSTs

  const unreadAlerts = alerts.filter((a) => !a.read).length;
  const markAlertRead = (id) => setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
  const markAllAlertsRead = () => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));

  // ----------------------------------------------------------------------------
  // GHL WEBHOOK INTEGRATION
  // Posts a structured payload to a configured GHL Workflow Webhook URL.
  // GHL workflows accept any JSON body; we send a comprehensive shape that
  // includes both standard GHL contact fields (firstName, lastName, address1,
  // etc.) AND every custom metadata field the dashboard tracks. You map them
  // in the GHL workflow's Custom Action step.
  // ----------------------------------------------------------------------------
  const buildGhlPayload = (lead, eventContext = {}) => {
    const nameParts = (lead.owner || "").split(" ");
    const firstName = nameParts[1] || "";
    const lastName = nameParts[0] || "";
    const propZip = (lead.propertyCity.match(/\d{5}/) || [""])[0];
    return {
      // ---- Standard GHL contact fields ----
      firstName,
      lastName,
      name: lead.owner,
      address1: lead.propertyAddress,
      city: lead.propertyCity.split(",")[0]?.trim() || "",
      state: "FL",
      postalCode: propZip,
      country: "US",
      // ---- Tags GHL should apply ----
      tags: [
        getPrimaryLeadType(lead),
        lead.estateTag,
        lead.absenteeTier ? `Absentee-${lead.absenteeTier.replace(/\s/g, "")}` : null,
        lead.mlsStatus && lead.mlsStatus !== "Off-Market" ? `MLS-${lead.mlsStatus}` : null,
        ...(lead.paTags || []).map((t) => t.replace(/\s|\//g, "")),
        ...(lead.flags || []).filter((f) => f === "STACKED" || f === "High equity"),
      ].filter(Boolean),
      // ---- Custom field payload (map these in GHL workflow) ----
      customFields: {
        folio: lead.folio,
        motivatedScore: lead.score,
        leadType: getPrimaryLeadType(lead),
        amountOwed: lead.amount,
        filedDate: lead.filed,
        legalDescription: lead.legalDesc,
        equityTier: lead.equity,
        // MLS
        mlsStatus: lead.mlsStatus,
        mlsListPrice: lead.mlsListPrice,
        mlsDaysOnMarket: lead.mlsDaysOnMarket,
        mlsListingAgent: lead.mlsListingAgent,
        // Mailing (for direct mail)
        mailingAddress: lead.mailingAddress,
        mailingCityStateZip: lead.mailingCity,
        // Estate
        estateTag: lead.estateTag,
        personalRepresentative: lead.estatePersonalRepresentative,
        livingCoOwner: lead.estateLivingCoOwner,
        lifeEstateHolder: lead.estateLifeEstateHolder,
        remaindermen: lead.estateRemaindermen ? lead.estateRemaindermen.join("; ") : "",
        yearsHeld: lead.estateYearsHeld,
        lastSaleDate: lead.lastSaleDate,
        // PA exemptions
        seniorExemption: (lead.paTags || []).includes("Senior"),
        widowExemption: (lead.paTags || []).includes("Widow/Widower"),
        adversePossession: (lead.paTags || []).includes("Adverse Possession"),
        // Absentee
        absenteeTier: lead.absenteeTier,
        absenteeMailingLocation: lead.absenteeMailingLocation,
        absenteeIsLlc: lead.absenteeIsLlc,
        // Possible PI (partial-interest sale)
        possiblePi: !!lead.possiblePi,
        piBuyerEntity: lead.possiblePi?.buyerEntity || "",
        piSoldPrice: lead.possiblePi?.soldPrice || "",
        piSoldDate: lead.possiblePi?.soldDate || "",
        piRemainingCoOwners: lead.possiblePi?.remainingCoOwners?.join("; ") || "",
        // Possible PACE
        possiblePace: !!lead.possiblePace,
        pacePriorYearTax: lead.possiblePace?.priorYearTax || "",
        paceJumpYearTax: lead.possiblePace?.jumpYearTax || "",
        paceJumpYear: lead.possiblePace?.jumpYear || "",
        paceMultiplier: lead.possiblePace?.multiplier?.toFixed(2) || "",
        // Reverse Mortgage
        reverseMortgage: !!lead.reverseMortgage,
        rmLender: lead.reverseMortgage?.lender || "",
        rmRecordedDate: lead.reverseMortgage?.recordedDate || "",
        rmOriginalLoan: lead.reverseMortgage?.actualLoanAmount || "",
        rmCurrentBalance: lead.reverseMortgage?.currentBalance || "",
        // Research links — both fields now populated with the unified web
        // search URL (Phase 8.5 of migration plan will split these back into
        // dedicated 1-click Zillow + Street View URLs once ZPID and panoid
        // are cached). Field names preserved so GHL automations referencing
        // them keep working.
        zillowUrl: buildSearchUrl(lead),
        streetViewUrl: buildSearchUrl(lead),
        propertyAppraiserUrl: `https://apps.miamidadepa.gov/propertysearch/#/?folio=${lead.folio.replace(/-/g, "")}`,
      },
      // ---- Event context (which alert triggered this) ----
      event: eventContext,
      timestamp: new Date().toISOString(),
    };
  };

  const postToGhl = async (url, payload, meta) => {
    if (!url) return { skipped: "no URL configured" };
    const startedAt = new Date().toISOString();
    try {
      // In a production environment with a CORS-permissive backend, this is
      // the actual POST. In the prototype we simulate the response since we
      // don't have a real GHL webhook URL to hit, but the contract matches.
      const isSimulation = url.includes("simulate") || !url.startsWith("http");
      let status, response;
      if (isSimulation) {
        // Simulate a 200 OK after a brief "network" delay
        await new Promise((res) => setTimeout(res, 300));
        status = 200;
        response = "Simulated · GHL would receive the payload above";
      } else {
        // Real POST. Note: GHL webhook URLs are CORS-permissive for inbound POST.
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        status = res.status;
        response = res.ok ? "Delivered" : `HTTP ${res.status}`;
      }
      const entry = {
        id: Date.now() + Math.random(),
        at: startedAt,
        eventType: meta.eventType,
        leadId: meta.leadId,
        leadAddress: meta.leadAddress,
        url,
        status,
        response,
        success: status >= 200 && status < 300,
      };
      setGhlActivity((prev) => [entry, ...prev].slice(0, 100));
      return { status, response };
    } catch (err) {
      const entry = {
        id: Date.now() + Math.random(),
        at: startedAt,
        eventType: meta.eventType,
        leadId: meta.leadId,
        leadAddress: meta.leadAddress,
        url,
        status: 0,
        response: err.message,
        success: false,
      };
      setGhlActivity((prev) => [entry, ...prev].slice(0, 100));
      return { error: err.message };
    }
  };

  // Fire a webhook for an alert event when both (a) the user enabled GHL
  // delivery for this event type, and (b) a webhook URL is configured.
  const fireAlertWebhook = async (alert, lead) => {
    if (!alertPrefs[alert.type]?.ghl) return;
    const url = ghlWebhooks[alert.type];
    if (!url) return;
    const payload = buildGhlPayload(lead, {
      alertType: alert.type,
      alertPayload: alert.payload,
      alertTime: alert.at,
    });
    return postToGhl(url, payload, {
      eventType: alert.type,
      leadId: lead.id,
      leadAddress: lead.propertyAddress,
    });
  };

  // JURISDICTION GATE: applies before everything else. When a folio prefix is
  // selected, every count, every filter, every export only sees leads in that
  // municipality. Different prefix = different market = never mixed.
  // View mode also applies here: Active mode hides sold leads, Sold mode only shows them.
  const jurisdictionScoped = useMemo(() => {
    let rows = recognizedLeads;
    if (viewMode === "active") rows = rows.filter((r) => !r.soldAt);
    else if (viewMode === "sold") rows = rows.filter((r) => !!r.soldAt);
    if (jurisdictionFilter === "All") return rows;
    return rows.filter((r) => folioPrefix(r.folio) === jurisdictionFilter);
  }, [recognizedLeads, jurisdictionFilter, viewMode]);

  // Counts of sold leads within the current jurisdiction (for the toggle badge)
  const soldCount = useMemo(() => {
    return recognizedLeads.filter((r) =>
      r.soldAt && (jurisdictionFilter === "All" || folioPrefix(r.folio) === jurisdictionFilter)
    ).length;
  }, [recognizedLeads, jurisdictionFilter]);
  const activeCount = useMemo(() => {
    return recognizedLeads.filter((r) =>
      !r.soldAt && (jurisdictionFilter === "All" || folioPrefix(r.folio) === jurisdictionFilter)
    ).length;
  }, [recognizedLeads, jurisdictionFilter]);

  // ----------------------------------------------------------------------------
  // ACTIVE FILTER COUNT + CLEAR ALL
  // Counts every filter set to a non-default value. Used by the Filters button
  // in the toolbar to (a) show how many filters are active, and (b) reset them
  // all to defaults in one click.
  //
  // Note: jurisdictionFilter is intentionally NOT counted/cleared. Most users
  // work persistently in their geography (a Miami wholesaler doesn't want to
  // reset their city scope every time they tidy other filters). If that turns
  // out wrong we can add it.
  // ----------------------------------------------------------------------------
  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (activeType.length > 0) n++;
    if (typeTagIntersection) n++;
    if (scoreFilter.length > 0) n++;
    if (mlsFilter.length > 0) n++;
    if (activeDomFilter) n++;
    if (ownerStatusFilter.length > 0) n++;
    if (paTagFilter.length > 0) n++;
    if (absenteeFilter.length > 0) n++;
    if (verdictFilter !== "All") n++;
    if (auctionUrgencyFilter.length > 0) n++;
    if (auctionOutcomeFilter) n++;
    if (codeViolationsFilter) n++;
    if (violationCategoryFilter) n++;
    if (conditionTagFilter) n++;
    if (importSourceFilter) n++;
    if (possiblePiFilter) n++;
    if (possiblePaceFilter) n++;
    if (reverseMortgageFilter) n++;
    if (searchQuery && searchQuery.trim()) n++;
    return n;
  }, [activeType, typeTagIntersection, scoreFilter, mlsFilter, activeDomFilter, ownerStatusFilter,
      paTagFilter, absenteeFilter, verdictFilter, auctionUrgencyFilter,
      auctionOutcomeFilter, codeViolationsFilter, violationCategoryFilter,
      conditionTagFilter, importSourceFilter, possiblePiFilter, possiblePaceFilter,
      reverseMortgageFilter, searchQuery]);

  const clearAllFilters = () => {
    setActiveType([]);
    setTypeTagIntersection(null);
    setScoreFilter([]);
    setMlsFilter([]);
    setOwnerStatusFilter([]);
    setPaTagFilter([]);
    setAbsenteeFilter([]);
    setVerdictFilter("All");
    setAuctionUrgencyFilter([]);
    setAuctionOutcomeFilter(null);
    setCodeViolationsFilter(false);
    setViolationCategoryFilter(null);
    setConditionTagFilter(null);
    setImportSourceFilter(null);
    setPossiblePiFilter(false);
    setPossiblePaceFilter(false);
    setReverseMortgageFilter(false);
    setSearchQuery("");
  };

  // Filtered records (jurisdiction → type → score → mls → search → sort)
  const filtered = useMemo(() => {
    let rows = jurisdictionScoped;
    if (typeTagIntersection) {
      // Intersection filter: type must match AND the configured dimension matches.
      // Four dimensions supported:
      //   - probateStatus: matches lead.probateStatus (active/dismissed/closed)
      //   - outcome:    matches lead.auctionData.outcome (e.g. cancelled_bk, sold)
      //   - tag === "__OTHER__":  matches when lead has NO estate tag
      //   - tag === "EST OF" etc: matches when lead has that estate tag
      rows = rows.filter((r) => {
        if (!hasListType(r, typeTagIntersection.type)) return false;
        if (typeTagIntersection.probateStatus) {
          return r.probateStatus === typeTagIntersection.probateStatus;
        }
        if (typeTagIntersection.outcome) {
          return r.auctionData?.outcome === typeTagIntersection.outcome;
        }
        if (typeTagIntersection.parentFamily === "Property Liens") {
          return r.liens.some(l => l.tier === typeTagIntersection.tier) && (typeTagIntersection.tag == null || hasListType(r, ESTATE_TAG_TO_LIST_TYPE[typeTagIntersection.tag]));
        }
        if (typeTagIntersection.parentFamily === "Federal Tax Liens") {
          return hasListType(r, "Federal Tax Liens") && hasListType(r, ESTATE_TAG_TO_LIST_TYPE[typeTagIntersection.tag]);
        }
        if (typeTagIntersection.parentFamily === "Other Liens") {
          return hasListType(r, "Other Liens") && hasListType(r, ESTATE_TAG_TO_LIST_TYPE[typeTagIntersection.tag]);
        }
        if (typeTagIntersection.parentFamily === "Judgments") {
          return hasListType(r, "Judgments") && hasListType(r, ESTATE_TAG_TO_LIST_TYPE[typeTagIntersection.tag]);
        }
        const tag = typeTagIntersection.tag;
        if (tag === "__OTHER__") {
          return !r.estateTag || !ESTATE_TAG_KEYS.includes(r.estateTag);
        }
        if (r.estateTag === tag) return true;
        if (Array.isArray(r.paTags) && r.paTags.includes(tag)) return true;
        return false;
      });
    } else if (activeType.length > 0) {
      rows = rows.filter((r) => activeType.some(t => hasListType(r, t)));
    }
    if (conditionTagFilter) {
      rows = rows.filter((r) => Array.isArray(r.conditionTags) && r.conditionTags.includes(conditionTagFilter));
    }
    // Score: each value defines a score band; multi-select = union of bands
    if (scoreFilter.length > 0) {
      rows = rows.filter((r) => scoreFilter.some((band) => {
        if (band === "Hot")    return r.score >= 70;
        if (band === "Warm")   return r.score >= 50 && r.score < 70;
        if (band === "Active") return r.score >= 30 && r.score < 50;
        if (band === "Cold")   return r.score < 50;
        return false;
      }));
    }
    if (mlsFilter.length > 0) {
      rows = rows.filter((r) => mlsFilter.includes(r.mlsStatus));
    } else if (activeDomFilter) {
      // "Active DOM 90+" — Active MLS listings stale 90+ days on market.
      // Outreach is still technically blocked while the listing agreement
      // is live, but these are the leads to queue up — statistically the
      // cohort most likely to expire soon, unlocking outreach automatically.
      rows = rows.filter((r) => r.mlsStatus === "Active" && (r.mlsDaysOnMarket || 0) >= 90);
    } else if (!quickFilter && activeType.length === 0 && ownerStatusFilter.length === 0 && !typeTagIntersection) {
      // DEFAULT BEHAVIOR — hide actively-listed leads (Active/Pending) only when
      // the user is browsing with no explicit pill or stat-card filter set.
      // Rationale:
      //   - Active/Pending = owner is currently using a Realtor; wholesaler
      //     can't compete and the MLS outreach guardrail blocks contact anyway
      //   - Expired/Canceled/Came Back = listing failed → highly motivated;
      //     keep these visible by default
      //   - Off-Market and unknown-status = standard wholesale targets
      // When the user clicks any pill (lead type, estate status) or stat card,
      // the count on that pill/card is the contract — show every matching lead
      // regardless of MLS status. The pill counts come from totals which
      // count over the full jurisdictionScoped set including Active/Pending.
      rows = rows.filter((r) => r.mlsStatus !== "Active" && r.mlsStatus !== "Pending");
    }
    if (ownerStatusFilter.length > 0) rows = rows.filter((r) => ownerStatusFilter.includes(ESTATE_TAG_TO_LIST_TYPE[r.estateTag]));
    if (paTagFilter.length > 0)       rows = rows.filter((r) => paTagFilter.some((t) => (r.paTags || []).includes(t)));
    if (absenteeFilter.length > 0) {
      // "Any" inside the array means "any absentee tier set"; otherwise match specific tiers
      if (absenteeFilter.includes("Any")) {
        rows = rows.filter((r) => !!r.absenteeTier);
      } else {
        rows = rows.filter((r) => absenteeFilter.includes(r.absenteeTier));
      }
    }
    if (possiblePiFilter) rows = rows.filter((r) => !!r.possiblePi);
    if (possiblePaceFilter) rows = rows.filter((r) => !!r.possiblePace);
    if (reverseMortgageFilter) rows = rows.filter((r) => !!r.reverseMortgage);
    if (codeViolationsFilter) rows = rows.filter((r) => r.codeViolationsSummary?.activeCount > 0);
    if (violationCategoryFilter) rows = rows.filter((r) => r.codeViolationsSummary?.activeCategories?.includes(violationCategoryFilter));
    if (importSourceFilter) rows = rows.filter((r) => Array.isArray(r.importSources) && r.importSources.includes(importSourceFilter));
    if (verdictFilter !== "All") rows = rows.filter((r) => r.auctionData?.verdict === verdictFilter);
    if (auctionUrgencyFilter.length > 0) rows = rows.filter((r) => {
      const d = daysUntilAuction(r.auctionData?.auctionDate);
      if (d === null || d < 0) return false;
      return auctionUrgencyFilter.some((tier) => {
        if (tier === "lte30")  return d <= 30;
        if (tier === "31to60") return d > 30 && d <= 60;
        if (tier === "gte61")  return d > 60;
        return false;
      });
    });
    if (auctionOutcomeFilter) {
      rows = rows.filter((r) => r.auctionData?.outcome === auctionOutcomeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.owner.toLowerCase().includes(q) ||
          r.propertyAddress.toLowerCase().includes(q) ||
          (r.propertyCity || "").toLowerCase().includes(q) ||
          r.folio.toLowerCase().includes(q) ||
          r.legalDesc.toLowerCase().includes(q)
      );
    }

    // Stat-card quick filter. Same criteria as the corresponding totals counter,
    // so the card's number always matches the row count after applying.
    if (quickFilter) {
      const today = new Date("2026-05-10");
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (quickFilter === "hotToCall") {
        rows = rows.filter((r) => {
          if ((r.score || 0) < 70) return false;
          const lastTouchStr = r.lastContactedAt || r.notesUpdatedAt;
          const lastTouch = lastTouchStr ? new Date(lastTouchStr) : null;
          return !lastTouch || lastTouch < sevenDaysAgo;
        });
      } else if (quickFilter === "auctionsImminent") {
        rows = rows.filter((r) => {
          const d = daysUntilAuction(r.auctionData?.auctionDate);
          return d !== null && d >= 0 && d <= 30 && !r.auctionData?.outcome;
        });
      } else if (quickFilter === "auctions31to60") {
        rows = rows.filter((r) => {
          const d = daysUntilAuction(r.auctionData?.auctionDate);
          return d !== null && d > 30 && d <= 60 && !r.auctionData?.outcome;
        });
      } else if (quickFilter === "newThisWeek") {
        rows = rows.filter((r) => r.filed && new Date(r.filed) >= sevenDaysAgo);
      } else if (quickFilter === "notInCrm") {
        rows = rows.filter((r) => !r.inCrm);
      } else if (quickFilter === "newMlsActive") {
        rows = rows.filter((r) => {
          if (r.mlsStatus !== "Active" || !r.mlsListDate) return false;
          const ld = new Date(r.mlsListDate);
          return !isNaN(ld) && ld >= sevenDaysAgo;
        });
      }
    }

    // Column-header sort. Each case maps the column to the lead field used
    // for comparison. Numeric/boolean fields compare with subtraction;
    // text/date fields use localeCompare. Direction multiplier (`dir`) flips
    // the result for descending.
    const dir = sortDir === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      switch (sortField) {
        case "score":              return ((a.score || 0) - (b.score || 0)) * dir;
        case "badConditionScore":  return ((a.badConditionScore || 0) - (b.badConditionScore || 0)) * dir;
        case "stackCount":         return ((a.stackCount || 0) - (b.stackCount || 0)) * dir;
        case "type":               return (getPrimaryLeadType(a) || "").localeCompare(getPrimaryLeadType(b) || "") * dir;
        case "amount":             return ((a.amount || 0) - (b.amount || 0)) * dir;
        case "equityApproxAmount": return ((a.equityApproxAmount || 0) - (b.equityApproxAmount || 0)) * dir;
        case "filed":              return (a.filed || "").localeCompare(b.filed || "") * dir;
        case "auctionDate":        return (a.auctionData?.auctionDate || "zzz").localeCompare(b.auctionData?.auctionDate || "zzz") * dir;
        case "owner":              return (a.owner || "").localeCompare(b.owner || "") * dir;
        case "propertyAddress":    return (a.propertyAddress || "").localeCompare(b.propertyAddress || "") * dir;
        case "mailingCity":        return (a.mailingCity || "").localeCompare(b.mailingCity || "") * dir;
        case "propertyType":       return (a.propertyType || "").localeCompare(b.propertyType || "") * dir;
        case "inCrm":              return ((a.inCrm ? 1 : 0) - (b.inCrm ? 1 : 0)) * dir;
        default:                   return ((b.score || 0) - (a.score || 0));
      }
    });
    return rows;
  }, [jurisdictionScoped, activeType, typeTagIntersection, conditionTagFilter, scoreFilter, mlsFilter, activeDomFilter, ownerStatusFilter, paTagFilter, absenteeFilter, possiblePiFilter, possiblePaceFilter, reverseMortgageFilter, codeViolationsFilter, violationCategoryFilter, importSourceFilter, verdictFilter, auctionUrgencyFilter, auctionOutcomeFilter, searchQuery, sortField, sortDir, quickFilter]);

  // Totals — computed against the jurisdiction-scoped pool, not the global pool,
  // so sidebar counts always reflect what's actually selectable.
  const totals = useMemo(() => {
    // "Today" reference — matches the demo's frozen 2026-05-10 timestamp used
    // throughout the dashboard for deterministic auction urgency, etc.
    const today = new Date("2026-05-10");
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const t = {
      total: jurisdictionScoped.length,
      hot: 0, warm: 0, withAddress: 0,
      // Action-oriented counts (shown in the top stat cards):
      hotToCall: 0,         // Hot lead (≥70) AND no contact in last 7 days
      auctionsImminent: 0,  // Pending auction within next 30 days
      auctions31to60: 0,    // Pending auction 31-60 days out (warning tier)
      newThisWeek: 0,       // Filed in the last 7 days
      notInCrm: 0,          // Not yet pushed to CRM
      newMlsActive: 0,      // MLS-Active with mlsListDate in past 7 days (last MLS import batch)
    };
    const byType = LEAD_TYPES.reduce((acc, t) => { acc[t.key] = 0; return acc; }, {});
    const byListType = LIST_TYPE_NAMES.reduce((acc, name) => { acc[name] = 0; return acc; }, {});
    const byPropLienTier = { "<$50K": 0, "$50-100K": 0, "$100K+": 0 };
    const byMls = { Active: 0, Pending: 0, "Came Back": 0, Expired: 0, Canceled: 0, "Off-Market": 0, "Active DOM 90+": 0 };
    const byOwnerStatus = { "Deceased": 0, "Deceased/2nd Owner": 0, "LE / REM": 0, "Possible Deceased": 0 };
    const byPaTag = { "Senior": 0, "Widow/Widower": 0, "Homestead Penalty": 0 };
    const byAbsentee = { "In County": 0, "In State": 0, "Out of State": 0, "Out of Country": 0, "Any": 0 };
    let possiblePiCount = 0;
    let possiblePaceCount = 0;
    let reverseMortgageCount = 0;
    let codeViolationsCount = 0;
    const importSourceCounts = {};
    Object.keys(IMPORT_SCHEMAS).forEach((k) => { importSourceCounts[k] = 0; });
    const codeViolationCategoryCounts = {};
    VIOLATION_CATEGORIES.forEach((c) => { codeViolationCategoryCounts[c.key] = 0; });
    const byVerdict = { PURSUE: 0, PASS: 0 };
    const auctionUrgencyCounts = { lte30: 0, "31to60": 0, gte61: 0 };
    // Cross-family outcome counts. Counted from the lead's auction outcome
    // regardless of which family (Tax Deed Auction or PFC Auction) it belongs to.
    const auctionOutcomeCounts = { cancelled_bk: 0, cancelled_county: 0, buyer_walked: 0, redeemed: 0, sold: 0 };
    // Counts for virtual "Type + Tag" intersection rows (e.g. "Tax Deed EST OF")
    const typeTagIntersectionCounts = {};
    LEAD_TYPE_TAG_INTERSECTIONS.forEach((it) => { typeTagIntersectionCounts[it.key] = 0; });
    // Counts for property condition tags (Vacant / D4D / etc.)
    const conditionTagCounts = {};
    BAD_CONDITION_TAGS.forEach((t) => { conditionTagCounts[t.key] = 0; });
    for (const r of jurisdictionScoped) {
      if (r.score >= 70) t.hot++;
      else if (r.score >= 50) t.warm++;
      if (r.propertyAddress) t.withAddress++;

      // ACTION-ORIENTED COUNTS — drive the top stat cards
      // "Hot to call": score ≥70 AND no engagement in the last 7 days. Engagement
      // is proxied by lastContactedAt (set by outreach action) OR notesUpdatedAt
      // (treating a notes update as a touch). Null on both = never contacted.
      if (r.score >= 70) {
        const lastTouchStr = r.lastContactedAt || r.notesUpdatedAt;
        const lastTouch = lastTouchStr ? new Date(lastTouchStr) : null;
        if (!lastTouch || lastTouch < sevenDaysAgo) t.hotToCall++;
      }
      // "Auctions imminent": auction date set, ≤30 days out, no outcome yet
      const _dta = daysUntilAuction(r.auctionData?.auctionDate);
      if (_dta !== null && !r.auctionData?.outcome) {
        if (_dta >= 0 && _dta <= 30) t.auctionsImminent++;
        else if (_dta > 30 && _dta <= 60) t.auctions31to60++;
      }
      // "New this week": filed within the last 7 days
      if (r.filed) {
        const filedDate = new Date(r.filed);
        if (filedDate >= sevenDaysAgo) t.newThisWeek++;
      }
      // "Not in CRM": still needs to be pushed to GHL
      if (!r.inCrm) t.notInCrm++;
      // "New MLS Active": newly listed on MLS within the past 7 days. In production
      // this would key off mlsImportedAt (the last MLS batch's import timestamp);
      // for the demo we approximate with mlsListDate within the trailing 7-day
      // window. Card is meant as a "skip outreach — just update CRM" reminder
      // since these properties have active listing agreements with other agents.
      if (r.mlsStatus === "Active" && r.mlsListDate) {
        const listDate = new Date(r.mlsListDate);
        if (!isNaN(listDate) && listDate >= sevenDaysAgo) t.newMlsActive++;
      }
      const primaryType = getPrimaryLeadType(r);
      if (primaryType && byType[primaryType] !== undefined) byType[primaryType]++;
      if (Array.isArray(r.listTypes)) {
        r.listTypes.forEach((lt) => {
          if (byListType[lt.name] !== undefined) byListType[lt.name]++;
        });
      }
      if (Array.isArray(r.liens) && hasListType(r, "Property Liens")) {
        r.liens.forEach((l) => {
          if (byPropLienTier[l.tier] !== undefined) byPropLienTier[l.tier]++;
        });
      }
      if (byMls[r.mlsStatus] !== undefined) byMls[r.mlsStatus]++;
      // Long-DOM Active sub-count — overlaps with the regular Active count
      // (a lead can be both "Active" AND "Active DOM 90+"). Same approach as
      // the existing absentee tier counts where a lead belongs to multiple
      // buckets and we tally each independently.
      if (r.mlsStatus === "Active" && (r.mlsDaysOnMarket || 0) >= 90) byMls["Active DOM 90+"]++;
      if (r.estateTag && byOwnerStatus[ESTATE_TAG_TO_LIST_TYPE[r.estateTag]] !== undefined) byOwnerStatus[ESTATE_TAG_TO_LIST_TYPE[r.estateTag]]++;
      (r.paTags || []).forEach((tag) => {
        if (byPaTag[tag] !== undefined) byPaTag[tag]++;
      });
      if (r.absenteeTier && byAbsentee[r.absenteeTier] !== undefined) {
        byAbsentee[r.absenteeTier]++;
        byAbsentee.Any++;
      }
      if (r.possiblePi) possiblePiCount++;
      if (r.possiblePace) possiblePaceCount++;
      if (r.reverseMortgage) reverseMortgageCount++;
      if (r.codeViolationsSummary?.activeCount > 0) codeViolationsCount++;
      if (Array.isArray(r.importSources)) {
        r.importSources.forEach((src) => {
          if (importSourceCounts[src] !== undefined) importSourceCounts[src]++;
        });
      }
      (r.codeViolationsSummary?.activeCategories || []).forEach((catKey) => {
        if (codeViolationCategoryCounts[catKey] !== undefined) codeViolationCategoryCounts[catKey]++;
      });
      if (r.auctionData?.verdict) byVerdict[r.auctionData.verdict]++;
      const dta = daysUntilAuction(r.auctionData?.auctionDate);
      if (dta !== null && dta >= 0) {
        if (dta <= 30) auctionUrgencyCounts.lte30++;
        else if (dta <= 60) auctionUrgencyCounts["31to60"]++;
        else auctionUrgencyCounts.gte61++;
      }
      // Virtual intersection rows (Tax Deed EST OF, Tax Deed Other, etc.)
      // Outcome-based intersections (Cancelled BK, Cancelled Other, Sold) are
      // counted separately below from recognizedLeads, so the Sold counts
      // reflect true cross-view totals rather than dropping to 0 in Active view.
      for (const it of LEAD_TYPE_TAG_INTERSECTIONS) {
        if (!hasListType(r, it.type)) continue;
        if (it.outcome) continue; // handled in the recognizedLeads pass below
        let matches;
        if (it.probateStatus) {
          matches = r.probateStatus === it.probateStatus;
        } else if (it.tag === "__OTHER__") {
          matches = !r.estateTag || !ESTATE_TAG_KEYS.includes(r.estateTag);
        } else if (it.parentFamily === "Property Liens") {
          matches = r.liens.some(l => l.tier === it.tier) && hasListType(r, ESTATE_TAG_TO_LIST_TYPE[it.tag]);
        } else if (it.parentFamily === "Federal Tax Liens") {
          matches = hasListType(r, "Federal Tax Liens") && hasListType(r, ESTATE_TAG_TO_LIST_TYPE[it.tag]);
        } else if (it.parentFamily === "Other Liens") {
          matches = hasListType(r, "Other Liens") && hasListType(r, ESTATE_TAG_TO_LIST_TYPE[it.tag]);
        } else if (it.parentFamily === "Judgments") {
          matches = hasListType(r, "Judgments") && hasListType(r, ESTATE_TAG_TO_LIST_TYPE[it.tag]);
        } else {
          matches = r.estateTag === it.tag || (Array.isArray(r.paTags) && r.paTags.includes(it.tag));
        }
        if (matches) typeTagIntersectionCounts[it.key]++;
      }
      // Condition tag counts
      if (Array.isArray(r.conditionTags)) {
        r.conditionTags.forEach((c) => {
          if (conditionTagCounts[c] !== undefined) conditionTagCounts[c]++;
        });
      }
    }
    // Outcome counts: source from recognizedLeads scoped to the current
    // jurisdiction filter, but NOT filtered by view mode. This way "Sold"
    // shows its true count even when the user is in active view (since
    // sold leads are filtered out of jurisdictionScoped in active view).
    // Both the aggregate AUCTION OUTCOME row counts AND the per-family
    // outcome intersection rows count from this same pass — so the numbers
    // reconcile (e.g. PFC Auction Sold + Tax Deed Auction Sold = Sold total).
    for (const r of recognizedLeads) {
      if (jurisdictionFilter !== "All" && folioPrefix(r.folio) !== jurisdictionFilter) continue;
      const outcome = r.auctionData?.outcome;
      if (!outcome) continue;
      if (auctionOutcomeCounts[outcome] !== undefined) auctionOutcomeCounts[outcome]++;
      // Per-family outcome intersections (e.g. "PFC Auction Sold")
      for (const it of LEAD_TYPE_TAG_INTERSECTIONS) {
        if (getPrimaryLeadType(r) === it.type && outcome === it.outcome) {
          typeTagIntersectionCounts[it.key]++;
        }
      }
    }
    return { ...t, byType, byListType, byPropLienTier, byMls, byOwnerStatus, byPaTag, byAbsentee, possiblePiCount, possiblePaceCount, reverseMortgageCount, codeViolationsCount, codeViolationCategoryCounts, importSourceCounts, byVerdict, auctionUrgencyCounts, auctionOutcomeCounts, typeTagIntersectionCounts, conditionTagCounts };
  }, [jurisdictionScoped, recognizedLeads, jurisdictionFilter]);

  // Jurisdiction picker options — every city in the authoritative table,
  // including cities with 0 leads (so the user can see their full coverage
  // area at a glance). Counts come from leads whose folio prefix is in the
  // authoritative table; leads with unrecognized prefixes are silently
  // rejected from the dashboard entirely (see jurisdictionScoped below).
  const jurisdictionOptions = useMemo(() => {
    const counts = {};
    for (const r of recognizedLeads) {
      const p = folioPrefix(r.folio);
      counts[p] = (counts[p] || 0) + 1;
    }
    return Object.entries(FOLIO_PREFIX_TO_MUNICIPALITY)
      .map(([prefix, municipality]) => ({
        prefix,
        municipality,
        count: counts[prefix] || 0,
      }))
      // Alphabetical by municipality name — easier to scan with 23 cities
      .sort((a, b) => a.municipality.localeCompare(b.municipality));
  }, [recognizedLeads]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filtered.length, totalPages, page]);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const exportGhl = async () => {
    // CRITICAL: never export Active or Pending MLS listings to GHL.
    // The user is licensed; pushing those into a campaign would cause an MLS rules violation.
    const exportable = filtered.filter((r) => !r.outreachBlocked && !r.soldAt);
    const rows = exportable.map((r) => ({
      "First Name": r.owner.split(" ")[1] || "",
      "Last Name": r.owner.split(" ")[0] || "",
      "Owner Full Name": r.owner,
      "Property Address": r.propertyAddress,
      "Property City": r.propertyCity.split(",")[0] || "",
      "Property State": "FL",
      "Property Zip": (r.propertyCity.match(/\d{5}/) || [""])[0],
      "Mailing Address": r.mailingAddress,
      "Mailing City State Zip": r.mailingCity,
      Folio: r.folio,
      "Lead Type": getPrimaryLeadType(r),
      "Motivated Score": r.score,
      "Amount Owed": r.amount,
      "Filed Date": r.filed,
      "MLS Status": r.mlsStatus || "Off-Market",
      "MLS ID": r.mlsId || "",
      "MLS List Price": r.mlsListPrice || "",
      "MLS DOM": r.mlsDaysOnMarket || "",
      "MLS Status Date": r.mlsStatusDate || "",
      "Last Sale Date (PA)": r.lastSaleDate || "Unknown",
      "Estate Tag": r.estateTag || "",
      "Estate Reason": r.estateReason || "",
      "Personal Representative": r.estatePersonalRepresentative || "",
      "Years Held": r.estateYearsHeld || "",
      "Deceased Co-Owner": r.estateDeceasedOwner || "",
      "Living Co-Owner": r.estateLivingCoOwner || "",
      "Life Estate Holder": r.estateLifeEstateHolder || "",
      "Remaindermen": r.estateRemaindermen ? r.estateRemaindermen.join(" | ") : "",
      "PA Tags": (r.paTags || []).join(" | "),
      "Senior Exemption": (r.paTags || []).includes("Senior") ? "Yes" : "",
      "Widow Exemption": (r.paTags || []).includes("Widow/Widower") ? "Yes" : "",
      "Adverse Possession": (r.paTags || []).includes("Adverse Possession") ? "Yes" : "",
      "Absentee Tier": r.absenteeTier || "",
      "Absentee Mailing Location": r.absenteeMailingLocation || "",
      "Absentee Is LLC": r.absenteeIsLlc ? "Yes" : "",
      "Possible Partial Interest": r.possiblePi ? "Yes" : "",
      "PI Buyer Entity": r.possiblePi?.buyerEntity || "",
      "PI Sold Price": r.possiblePi?.soldPrice || "",
      "PI Sold Date": r.possiblePi?.soldDate || "",
      "PI Remaining Co-Owners": r.possiblePi?.remainingCoOwners?.join(" | ") || "",
      "Possible PACE": r.possiblePace ? "Yes" : "",
      "PACE Prior Year Tax": r.possiblePace?.priorYearTax || "",
      "PACE Jump Year Tax": r.possiblePace?.jumpYearTax || "",
      "PACE Jump Year": r.possiblePace?.jumpYear || "",
      "PACE Multiplier": r.possiblePace?.multiplier?.toFixed(2) || "",
      "Reverse Mortgage": r.reverseMortgage ? "Yes" : "",
      "RM Lender": r.reverseMortgage?.lender || "",
      "RM Recorded Date": r.reverseMortgage?.recordedDate || "",
      "RM Original Loan": r.reverseMortgage?.actualLoanAmount || "",
      "RM Current Balance": r.reverseMortgage?.currentBalance || "",
      "Mortgage Lender": r.mortgageInfo?.lender || "",
      "Mortgage Original Loan": r.mortgageInfo?.originalLoan || "",
      "Mortgage Current Balance": r.mortgageInfo?.currentBalance || "",
      "Mortgage Lien Position": r.mortgageInfo?.lienPosition || "",
      "Mortgage Payment Status": r.mortgageInfo?.lastPaymentStatus || "",
      "Code Violations Active": r.codeViolationsSummary?.activeCount || 0,
      "Code Violations Total": r.codeViolationsSummary?.count || 0,
      "Code Violations Fines": r.codeViolationsSummary?.totalFines || "",
      "Violation Tags": (r.codeViolationsSummary?.activeCategories || []).map((k) => {
        const c = VIOLATION_CATEGORIES.find((cc) => cc.key === k);
        return c ? c.label : k;
      }).join(" | "),
      ...Object.fromEntries(VIOLATION_CATEGORIES.map((c) => [
        `Has ${c.label}`,
        r.codeViolationsSummary?.activeCategories?.includes(c.key) ? "Yes" : "",
      ])),
      "Final Judgment": r.auctionData?.finalJudgment || "",
      "PA Total Value": r.auctionData?.paTotalValue || "",
      "FJ vs PA %": r.auctionData?.paTotalValue && r.auctionData?.finalJudgment ? ((r.auctionData.finalJudgment / r.auctionData.paTotalValue) * 100).toFixed(1) + "%" : "",
      "ARV Estimate": r.auctionData?.arvEstimate || "",
      "Repairs Estimate": r.auctionData?.repairsEstimate || "",
      "Equity Cushion": r.auctionData?.equityCushion || "",
      "Equity Pct": r.auctionData?.equityPct ? (r.auctionData.equityPct * 100).toFixed(1) + "%" : "",
      "Max Wholesale Spread": r.auctionData?.maxSpread || "",
      "Verdict": r.auctionData?.verdict || "",
      "Auction Date": r.auctionData?.auctionDate || "",
      "Days Until Auction": r.auctionData?.auctionDate ? daysUntilAuction(r.auctionData.auctionDate) : "",
      "Plaintiff": r.auctionData?.plaintiff || "",
      "Case Number": r.auctionData?.caseNumber || "",
      Flags: r.flags.join(" | "),
      "Equity Tier": r.equity || "",
      "Legal Description": r.legalDesc,
      "Source URL": r.docLink,
      "Zillow URL": buildSearchUrl(r),
      "Street View URL": buildSearchUrl(r),
    }));
    const skipped = filtered.length - exportable.length;
    downloadCsv(rows, `miami-dade-ghl-export-${new Date().toISOString().split("T")[0]}.csv`);

    // If a bulk-export webhook is configured, also POST each lead in real time
    // so they create as GHL contacts immediately (with all tags + custom fields).
    if (ghlWebhooks.bulk_export) {
      let pushed = 0;
      let failed = 0;
      for (const r of exportable) {
        const result = await postToGhl(
          ghlWebhooks.bulk_export,
          buildGhlPayload(r, { source: "bulk_export", batchSize: exportable.length }),
          { eventType: "bulk_export", leadId: r.id, leadAddress: r.propertyAddress }
        );
        if (result?.error || (result?.status && result.status >= 400)) failed++;
        else pushed++;
      }
      const msg = [
        `Exported ${exportable.length} leads to CSV.`,
        ghlWebhooks.bulk_export ? `Pushed ${pushed} to GHL workflow${failed ? ` (${failed} failed — see Activity Log)` : ""}.` : "",
        skipped > 0 ? `${skipped} excluded (Active/Pending MLS listings or sold properties).` : "",
      ].filter(Boolean).join("\n\n");
      alert(msg);
    } else if (skipped > 0) {
      alert(`Exported ${exportable.length} leads.\n\n${skipped} Active/Pending MLS listing${skipped === 1 ? "" : "s"} excluded — direct seller outreach on those properties would violate the listing agreement and MIAMI MLS rules. They'll re-enter your export automatically when their status changes to Expired or Canceled.`);
    }
  };

  const exportSkipTrace = () => {
    // Skip-trace queries cost money per record AND are usually paired with cold outreach,
    // so apply the same MLS guardrail.
    const exportable = filtered.filter((r) => !r.outreachBlocked && !r.soldAt);
    const rows = exportable.map((r) => ({
      "Full Name": r.owner,
      "Property Address": r.propertyAddress,
      "Property City State Zip": r.propertyCity,
      "Mailing Address": r.mailingAddress,
      "Mailing City State Zip": r.mailingCity,
      Folio: r.folio,
    }));
    const skipped = filtered.length - exportable.length;
    downloadCsv(rows, `miami-dade-skiptrace-${new Date().toISOString().split("T")[0]}.csv`);
    if (skipped > 0) {
      alert(`Exported ${exportable.length} records for skip tracing.\n\n${skipped} Active/Pending MLS listing${skipped === 1 ? "" : "s"} excluded to avoid wasted skip-trace credits and MLS rules violations.`);
    }
  };

  const stackedCount = recognizedLeads.filter((r) => r.flags.includes("STACKED")).length;
  const taxImported = totals.byType.Tax;

  return (
    <div className="min-h-screen w-full" style={{ background: "#f4f6fb", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#0c4a6e,#0e7490)" }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M3 12l9-9 9 9v8a2 2 0 01-2 2h-4v-7H10v7H6a2 2 0 01-2-2v-8z" stroke="white" strokeWidth="2" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#0f172a" }}>
                MIAMI-DADE PROPERTY INTEL
              </h1>
              <div className="text-sm mt-0.5 flex items-center gap-2" style={{ color: "#64748b" }}>
                <span>Motivated Seller Intelligence</span>
                {jurisdictionFilter !== "All" && (
                  <button
                    onClick={() => setJurisdictionFilter("All")}
                    className="ml-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition hover:opacity-80"
                    style={{ background: "#dbeafe", color: "#1e40af" }}
                    title="Click to clear jurisdiction lock"
                  >
                    <Landmark className="w-3 h-3" />
                    <span className="font-mono">{jurisdictionFilter}-</span>
                    <span>{FOLIO_PREFIX_TO_MUNICIPALITY[jurisdictionFilter] || "Unknown"}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
              <Calendar className="w-3.5 h-3.5" />
              <span>Updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}, {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</span>
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            </div>
            <button
              onClick={() => setShowAlerts(true)}
              className="relative w-11 h-11 rounded-xl bg-white border flex items-center justify-center hover:bg-slate-50 transition"
              style={{ borderColor: "#e2e8f0", color: "#334155" }}
              title="Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: "#dc2626" }}>
                  {unreadAlerts > 99 ? "99+" : unreadAlerts}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowGhlSettings(true)}
              className="relative w-11 h-11 rounded-xl bg-white border flex items-center justify-center hover:bg-slate-50 transition"
              style={{ borderColor: "#e2e8f0", color: "#334155" }}
              title="GHL Webhook Integration"
            >
              <TrendingUp className="w-5 h-5" />
              {Object.values(ghlWebhooks).filter(Boolean).length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full" style={{ background: "#16a34a" }} title="GHL connected"></span>
              )}
            </button>
            <button
              onClick={() => setShowCodeViolationsApi(true)}
              className="relative w-11 h-11 rounded-xl bg-white border flex items-center justify-center hover:bg-slate-50 transition"
              style={{ borderColor: "#e2e8f0", color: "#334155" }}
              title="Code Violations API Settings"
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full" style={{ background: "#16a34a" }} title="Live API"></span>
            </button>
            <button onClick={exportGhl} className="px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 shadow-sm hover:shadow transition" style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}>
              <Download className="w-4 h-4" /> GHL CSV
            </button>
          </div>
        </div>

        {/* TOP ACTION BAR */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Active / Sold view toggle */}
          <div className="inline-flex rounded-xl border bg-white overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
            <button
              onClick={() => setViewMode("active")}
              className="px-4 py-3 text-sm font-semibold flex items-center gap-2 transition"
              style={{
                background: viewMode === "active" ? "#2563eb" : "transparent",
                color: viewMode === "active" ? "white" : "#475569",
              }}
            >
              <Database className="w-4 h-4" /> Active <span className="opacity-75 text-xs">{fmtCount(activeCount)}</span>
            </button>
            <button
              onClick={() => setViewMode("sold")}
              className="px-4 py-3 text-sm font-semibold flex items-center gap-2 transition border-l"
              style={{
                background: viewMode === "sold" ? "#16a34a" : "transparent",
                color: viewMode === "sold" ? "white" : "#475569",
                borderColor: "#e2e8f0",
              }}
            >
              <CheckCheck className="w-4 h-4" /> Recently Sold <span className="opacity-75 text-xs">{fmtCount(soldCount)}</span>
            </button>
          </div>
          <button onClick={() => setShowCalculator(true)} className="px-4 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-sm" style={{ background: "linear-gradient(135deg,#2563eb,#1e40af)" }}>
            <Calculator className="w-4 h-4" /> Calculator
          </button>
          <button onClick={() => setShowImportModal(true)} className="px-4 py-3 rounded-xl bg-white border font-medium flex items-center gap-2 hover:bg-green-50 transition" style={{ borderColor: "#bbf7d0", color: "#15803d" }}>
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button onClick={exportSkipTrace} className="px-4 py-3 rounded-xl bg-white border font-medium flex items-center gap-2 hover:bg-slate-50 transition" style={{ borderColor: "#e2e8f0", color: "#334155" }}>
            <Download className="w-4 h-4" /> Skip Trace CSV
          </button>
          <button onClick={exportGhl} className="px-4 py-3 rounded-xl bg-white border font-medium flex items-center gap-2 hover:bg-slate-50 transition" style={{ borderColor: "#e2e8f0", color: "#334155" }}>
            <Download className="w-4 h-4" /> GHL CSV
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDEBAR */}
          <div className="col-span-12 lg:col-span-2">
            <div className="text-[11px] font-bold tracking-wider mb-3" style={{ color: "#64748b" }}>JURISDICTION</div>
            <div className="space-y-1 mb-2">
              <SidebarItem
                icon={Landmark}
                label="All Miami-Dade"
                count={recognizedLeads.length}
                active={jurisdictionFilter === "All"}
                onClick={() => setJurisdictionFilter("All")}
                iconColor="#0891b2"
              />
              {/* Pinned: always-visible jurisdictions, in PINNED_PREFIXES order */}
              {PINNED_PREFIXES.map((prefix) => {
                const muni = FOLIO_PREFIX_TO_MUNICIPALITY[prefix];
                if (!muni) return null; // PINNED_PREFIXES should always be in the table
                const count = jurisdictionOptions.find((j) => j.prefix === prefix)?.count || 0;
                return (
                  <SidebarItem
                    key={prefix}
                    icon={Landmark}
                    label={`${prefix}- ${muni}`}
                    count={count}
                    active={jurisdictionFilter === prefix}
                    onClick={() => setJurisdictionFilter(prefix)}
                    iconColor="#0891b2"
                  />
                );
              })}
              {/* Dropdown: everything else with at least one lead, sorted by count */}
              {(() => {
                const dropdownOpts = jurisdictionOptions.filter((j) => !PINNED_PREFIXES.includes(j.prefix));
                if (dropdownOpts.length === 0) return null;
                const isPinnedActive = jurisdictionFilter === "All" || PINNED_PREFIXES.includes(jurisdictionFilter);
                return (
                  <div className="px-3 py-1.5">
                    <select
                      value={isPinnedActive ? "" : jurisdictionFilter}
                      onChange={(e) => e.target.value && setJurisdictionFilter(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 rounded border bg-white"
                      style={{ borderColor: "#e2e8f0", color: "#475569" }}
                    >
                      <option value="">More municipalities…</option>
                      {dropdownOpts.map((j) => (
                        <option key={j.prefix} value={j.prefix}>
                          {j.prefix}- {j.municipality}{j.count > 0 ? ` (${j.count})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}
            </div>
            <div className="text-[11px] font-bold tracking-wider mt-8 mb-3" style={{ color: "#64748b" }}>SCORE FILTERS</div>
            <div className="space-y-1">
              <SidebarItem icon={Star} label="All Scores" count={totals.total} active={scoreFilter.length === 0} onClick={() => setScoreFilter([])} iconColor="#3b82f6" />
              <SidebarItem icon={Flame} label="Hot (≥70)" count={totals.hot} active={scoreFilter.includes("Hot")} onClick={() => setScoreFilter(["Hot"])} iconColor="#dc2626" />
              <SidebarItem icon={Thermometer} label="Warm (≥50)" count={totals.warm} active={scoreFilter.includes("Warm")} onClick={() => setScoreFilter(["Warm"])} iconColor="#f59e0b" />
              <SidebarItem icon={TrendingUp} label="Active (≥30)" count={jurisdictionScoped.filter((r) => r.score >= 30 && r.score < 50).length} active={scoreFilter.includes("Active")} onClick={() => setScoreFilter(["Active"])} iconColor="#16a34a" />
            </div>
            <div className="text-[11px] font-bold tracking-wider mt-8 mb-3 flex items-center gap-2" style={{ color: "#64748b" }}>
              AUCTION DATA
              <span className="text-[9px] font-normal px-1.5 py-0.5 rounded" style={{ background: "#dcfce7", color: "#15803d" }}>RealForeclose</span>
            </div>
            <div className="space-y-1">
              <SidebarItem icon={Layers} label="All" count={totals.total} active={verdictFilter === "All"} onClick={() => setVerdictFilter("All")} iconColor="#64748b" />
              <SidebarItem icon={CheckCheck} label="Pursue ★" count={totals.byVerdict.PURSUE} active={verdictFilter === "PURSUE"} onClick={() => setVerdictFilter("PURSUE")} iconColor="#16a34a" />
              <SidebarItem icon={X} label="Pass" count={totals.byVerdict.PASS} active={verdictFilter === "PASS"} onClick={() => setVerdictFilter("PASS")} iconColor="#dc2626" />
              <SidebarItem icon={Flame} label="Auction ≤30 days" count={totals.auctionUrgencyCounts.lte30} active={auctionUrgencyFilter.includes("lte30")} onClick={() => setAuctionUrgencyFilter(auctionUrgencyFilter.includes("lte30") ? [] : ["lte30"])} iconColor="#dc2626" />
              <SidebarItem icon={Calendar} label="Auction 31-60 days" count={totals.auctionUrgencyCounts["31to60"]} active={auctionUrgencyFilter.includes("31to60")} onClick={() => setAuctionUrgencyFilter(auctionUrgencyFilter.includes("31to60") ? [] : ["31to60"])} iconColor="#ca8a04" />
              <SidebarItem icon={Calendar} label="Auction 61+ days" count={totals.auctionUrgencyCounts.gte61} active={auctionUrgencyFilter.includes("gte61")} onClick={() => setAuctionUrgencyFilter(auctionUrgencyFilter.includes("gte61") ? [] : ["gte61"])} iconColor="#2563eb" />
            </div>

            {/* AUCTION OUTCOME — cross-cuts both Tax Deed Auction and PFC Auction
                families. Filters by auctionData.outcome regardless of which family
                the lead belongs to. */}
            <div className="text-[11px] font-bold tracking-wider mt-8 mb-3" style={{ color: "#64748b" }}>AUCTION OUTCOME</div>
            <div className="space-y-1">
              <SidebarItem
                icon={Layers}
                label="All"
                count={totals.total}
                active={!auctionOutcomeFilter}
                onClick={() => setAuctionOutcomeFilter(null)}
                iconColor="#64748b"
              />
              <SidebarItem
                icon={AlertCircle}
                label="Cancelled — BK"
                count={totals.auctionOutcomeCounts.cancelled_bk}
                active={auctionOutcomeFilter === "cancelled_bk"}
                onClick={() => {
                  if (auctionOutcomeFilter === "cancelled_bk") {
                    setAuctionOutcomeFilter(null);
                  } else {
                    setAuctionOutcomeFilter("cancelled_bk");
                    // Clear per-family intersection if it was targeting an outcome
                    if (typeTagIntersection?.outcome) setTypeTagIntersection(null);
                  }
                }}
                iconColor="#14532d"
              />
              <SidebarItem
                icon={AlertCircle}
                label="Cancelled — County"
                count={totals.auctionOutcomeCounts.cancelled_county}
                active={auctionOutcomeFilter === "cancelled_county"}
                onClick={() => {
                  if (auctionOutcomeFilter === "cancelled_county") {
                    setAuctionOutcomeFilter(null);
                  } else {
                    setAuctionOutcomeFilter("cancelled_county");
                    if (typeTagIntersection?.outcome) setTypeTagIntersection(null);
                  }
                }}
                iconColor="#14532d"
              />
              <SidebarItem
                icon={X}
                label="Buyer Walked"
                count={totals.auctionOutcomeCounts.buyer_walked}
                active={auctionOutcomeFilter === "buyer_walked"}
                onClick={() => {
                  if (auctionOutcomeFilter === "buyer_walked") {
                    setAuctionOutcomeFilter(null);
                  } else {
                    setAuctionOutcomeFilter("buyer_walked");
                    if (typeTagIntersection?.outcome) setTypeTagIntersection(null);
                  }
                }}
                iconColor="#14532d"
              />
              <SidebarItem
                icon={Home}
                label="Redeemed by Owner"
                count={totals.auctionOutcomeCounts.redeemed}
                active={auctionOutcomeFilter === "redeemed"}
                onClick={() => {
                  if (auctionOutcomeFilter === "redeemed") {
                    setAuctionOutcomeFilter(null);
                  } else {
                    setAuctionOutcomeFilter("redeemed");
                    if (typeTagIntersection?.outcome) setTypeTagIntersection(null);
                  }
                }}
                iconColor="#92400e"
              />
              <SidebarItem
                icon={Gavel}
                label="Sold at Auction"
                count={totals.auctionOutcomeCounts.sold}
                active={auctionOutcomeFilter === "sold"}
                onClick={() => {
                  if (auctionOutcomeFilter === "sold") {
                    setAuctionOutcomeFilter(null);
                  } else {
                    setAuctionOutcomeFilter("sold");
                    if (typeTagIntersection?.outcome) setTypeTagIntersection(null);
                    // Auto-switch to sold view since sold leads are filtered out of active
                    if (viewMode === "active") setViewMode("sold");
                  }
                }}
                iconColor="#991b1b"
              />
            </div>
            <div className="text-[11px] font-bold tracking-wider mt-8 mb-3" style={{ color: "#64748b" }}>LEAD TYPES</div>
            <div className="space-y-1">
              <SidebarItem
                icon={Layers}
                label="All"
                count={totals.total}
                active={activeType.length === 0 && !typeTagIntersection}
                onClick={() => { setActiveType([]); setTypeTagIntersection(null); }}
              />
              {/* Family-grouped rendering. For each family, render the base type
                  rows then any matching intersection sub-rows beneath. */}
              {(() => {
                const families = [];
                const seen = new Set();
                for (const t of LEAD_TYPES) {
                  if (!seen.has(t.family)) { families.push(t.family); seen.add(t.family); }
                }
                return families.map((family) => {
                  const familyTypes = LEAD_TYPES.filter((t) => t.family === family);
                  const familyIntersections = LEAD_TYPE_TAG_INTERSECTIONS.filter((it) => it.family === family);
                  return (
                    <React.Fragment key={family}>
                      {familyTypes.map((t) => (
                        <SidebarItem
                          key={t.key}
                          icon={t.icon}
                          label={t.label || t.key}
                          count={totals.byType[t.key] || 0}
                          active={activeType.includes(t.key) && !typeTagIntersection}
                          onClick={() => { setActiveType([t.key]); setTypeTagIntersection(null); }}
                          iconColor={t.color}
                        />
                      ))}
                      {/* Intersection sub-rows — indented, smaller text, marked with ◦ */}
                      {familyIntersections.map((it) => {
                        const isActive = typeTagIntersection?.type === it.type && (
                          it.probateStatus ? typeTagIntersection?.probateStatus === it.probateStatus
                          : it.outcome ? typeTagIntersection?.outcome === it.outcome
                          : it.parentFamily === "Property Liens" ? (typeTagIntersection?.tier === it.tier && typeTagIntersection?.tag === it.tag)
                          : it.parentFamily === "Federal Tax Liens" ? (typeTagIntersection?.tag === it.tag)
                          : it.parentFamily === "Other Liens" ? (typeTagIntersection?.tag === it.tag)
                          : it.parentFamily === "Judgments" ? (typeTagIntersection?.tag === it.tag)
                          : typeTagIntersection?.tag === it.tag
                        );
                        return (
                          <button
                            key={it.key}
                            onClick={() => {
                              if (isActive) {
                                setTypeTagIntersection(null);
                              } else {
                                setTypeTagIntersection(
                                  it.probateStatus
                                    ? { type: it.type, probateStatus: it.probateStatus }
                                    : it.outcome
                                      ? { type: it.type, outcome: it.outcome }
                                      : it.parentFamily === "Property Liens"
                                        ? { type: it.type, tier: it.tier, tag: it.tag }
                                        : it.parentFamily === "Federal Tax Liens"
                                          ? { type: it.type, tag: it.tag }
                                          : it.parentFamily === "Other Liens"
                                            ? { type: it.type, tag: it.tag }
                                            : it.parentFamily === "Judgments"
                                              ? { type: it.type, tag: it.tag }
                                              : { type: it.type, tag: it.tag }
                                );
                                setActiveType([]); // intersection supersedes type
                                // Outcome intersections cross-cut with the AUCTION OUTCOME
                                // aggregate — clear it so filters don't conflict
                                if (it.outcome) setAuctionOutcomeFilter(null);
                                // Sold leads are filtered out of active view, auto-switch
                                if (it.outcome === "sold" && viewMode === "active") setViewMode("sold");
                              }
                            }}
                            className="w-full flex items-center gap-2 pl-8 pr-3 py-1 rounded-lg text-[11px] font-medium transition"
                            style={{
                              background: isActive ? "#2563eb" : "transparent",
                              color: isActive ? "white" : "#64748b",
                            }}
                          >
                            <span className="text-[10px] opacity-70">◦</span>
                            <span className="flex-1 text-left truncate">{it.shortLabel || it.key}</span>
                            <span className="text-[10px] font-bold opacity-80">{fmtCount(totals.typeTagIntersectionCounts[it.key] || 0)}</span>
                          </button>
                        );
                      })}
                    </React.Fragment>
                  );
                });
              })()}
              {/* 2.7d: Lien-family 4-parent-block render. Each parent has
                  estate-tag leaves; Property Liens additionally has tier
                  sub-sections between parent and leaves. All levels clickable. */}
              {LIEN_PARENT_BLOCKS.map((block) => {
                const blockIntersections = LEAD_TYPE_TAG_INTERSECTIONS.filter(
                  (it) => it.parentFamily === block.name
                );
                return (
                  <React.Fragment key={block.name}>
                    <SidebarItem
                      icon={block.icon}
                      label={block.name}
                      count={totals.byListType[block.name] || 0}
                      active={activeType.includes(block.name) && !typeTagIntersection}
                      onClick={() => { setActiveType([block.name]); setTypeTagIntersection(null); }}
                      iconColor={block.color}
                    />
                    {block.tiers && block.tiers.map((tier) => {
                      const tierActive = typeTagIntersection?.type === block.name
                        && typeTagIntersection?.tier === tier
                        && typeTagIntersection?.tag == null;
                      const tierLeaves = blockIntersections.filter((it) => it.tier === tier);
                      return (
                        <React.Fragment key={`${block.name}-${tier}`}>
                          <button
                            onClick={() => {
                              setTypeTagIntersection({ type: block.name, parentFamily: block.name, tier, tag: null });
                              setActiveType([]);
                            }}
                            className="w-full flex items-center gap-2 pl-6 pr-3 py-1 rounded-lg text-[11px] font-semibold transition"
                            style={{
                              background: tierActive ? "#2563eb" : "transparent",
                              color: tierActive ? "white" : "#475569",
                            }}
                          >
                            <span className="flex-1 text-left truncate">{tier}</span>
                            <span className="text-[10px] font-bold opacity-80">{fmtCount(totals.byPropLienTier[tier] || 0)}</span>
                          </button>
                          {tierLeaves.map((it) => {
                            const isActive = typeTagIntersection?.type === it.type
                              && typeTagIntersection?.tier === it.tier
                              && typeTagIntersection?.tag === it.tag;
                            return (
                              <button
                                key={it.key}
                                onClick={() => {
                                  setTypeTagIntersection({ type: it.type, parentFamily: it.parentFamily, tier: it.tier, tag: it.tag });
                                  setActiveType([]);
                                }}
                                className="w-full flex items-center gap-2 pl-10 pr-3 py-1 rounded-lg text-[11px] font-medium transition"
                                style={{
                                  background: isActive ? "#2563eb" : "transparent",
                                  color: isActive ? "white" : "#64748b",
                                }}
                              >
                                <span className="text-[10px] opacity-70">◦</span>
                                <span className="flex-1 text-left truncate">{it.shortLabel}</span>
                                <span className="text-[10px] font-bold opacity-80">{fmtCount(totals.typeTagIntersectionCounts[it.key] || 0)}</span>
                              </button>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                    {!block.tiers && blockIntersections.map((it) => {
                      const isActive = typeTagIntersection?.type === it.type
                        && typeTagIntersection?.tag === it.tag;
                      return (
                        <button
                          key={it.key}
                          onClick={() => {
                            setTypeTagIntersection({ type: it.type, parentFamily: it.parentFamily, tag: it.tag });
                            setActiveType([]);
                          }}
                          className="w-full flex items-center gap-2 pl-8 pr-3 py-1 rounded-lg text-[11px] font-medium transition"
                          style={{
                            background: isActive ? "#2563eb" : "transparent",
                            color: isActive ? "white" : "#64748b",
                          }}
                        >
                          <span className="text-[10px] opacity-70">◦</span>
                          <span className="flex-1 text-left truncate">{it.shortLabel}</span>
                          <span className="text-[10px] font-bold opacity-80">{fmtCount(totals.typeTagIntersectionCounts[it.key] || 0)}</span>
                        </button>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>

            {/* CODE VIOLATIONS — live ArcGIS REST API integration (sidebar filters) */}
            <div className="text-[11px] font-bold tracking-wider mt-8 mb-3" style={{ color: "#64748b" }}>CODE VIOLATIONS ★ <span className="font-normal" style={{ color: "#94a3b8" }}>(live API)</span></div>
            <div className="space-y-1">
              <SidebarItem icon={AlertTriangle} label="Any Code Violations" count={totals.codeViolationsCount} active={codeViolationsFilter && !violationCategoryFilter} onClick={() => { setCodeViolationsFilter(!codeViolationsFilter); setViolationCategoryFilter(null); }} iconColor="#dc2626" />
              {VIOLATION_CATEGORIES.map((cat, idx) => (
                <React.Fragment key={cat.key}>
                  {cat.isCatchall && (
                    <div className="my-1 mx-2 h-px" style={{ background: "#e2e8f0" }}></div>
                  )}
                  <button
                    onClick={() => { setViolationCategoryFilter(violationCategoryFilter === cat.key ? null : cat.key); setCodeViolationsFilter(false); }}
                    className="w-full flex items-center gap-2 pl-8 pr-3 py-1.5 rounded-lg text-[12px] font-medium transition"
                    style={{
                      background: violationCategoryFilter === cat.key ? "#2563eb" : "transparent",
                      color: violationCategoryFilter === cat.key ? "white" : "#475569",
                    }}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: violationCategoryFilter === cat.key ? "white" : cat.color }}></span>
                    <span className="flex-1 text-left truncate">{cat.shortLabel}</span>
                    <span className="text-[11px] font-bold opacity-80">{fmtCount(totals.codeViolationCategoryCounts?.[cat.key] || 0)}</span>
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* PROPERTY CONDITION — Bad Condition Score signals */}
            <div className="text-[11px] font-bold tracking-wider mt-8 mb-3" style={{ color: "#64748b" }}>PROPERTY CONDITION</div>
            <div className="space-y-1">
              <SidebarItem
                icon={Layers}
                label="All"
                count={totals.total}
                active={!conditionTagFilter}
                onClick={() => setConditionTagFilter(null)}
                iconColor="#64748b"
              />
              {BAD_CONDITION_TAGS.map((c) => (
                <SidebarItem
                  key={c.key}
                  icon={Home}
                  label={c.label + (c.mainScoreBoost >= 20 ? " ★" : "")}
                  count={totals.conditionTagCounts[c.key] || 0}
                  active={conditionTagFilter === c.key}
                  onClick={() => setConditionTagFilter(conditionTagFilter === c.key ? null : c.key)}
                  iconColor={c.color}
                />
              ))}
            </div>
            <div className="text-[11px] font-bold tracking-wider mt-8 mb-3" style={{ color: "#64748b" }}>OWNER STATUS</div>
            <div className="space-y-1">
              <SidebarItem icon={Layers} label="All" count={totals.total} active={ownerStatusFilter.length === 0} onClick={() => setOwnerStatusFilter([])} iconColor="#64748b" />
              <SidebarItem icon={UserCircle} label="Deceased" count={totals.byOwnerStatus["Deceased"]} active={ownerStatusFilter.includes("Deceased")} onClick={() => setOwnerStatusFilter(["Deceased"])} iconColor="#16a34a" />
              <SidebarItem icon={UserCircle} label="Deceased/2nd Owner" count={totals.byOwnerStatus["Deceased/2nd Owner"]} active={ownerStatusFilter.includes("Deceased/2nd Owner")} onClick={() => setOwnerStatusFilter(["Deceased/2nd Owner"])} iconColor="#7c3aed" />
              <SidebarItem icon={UserCircle} label="Possible Deceased" count={totals.byOwnerStatus["Possible Deceased"]} active={ownerStatusFilter.includes("Possible Deceased")} onClick={() => setOwnerStatusFilter(["Possible Deceased"])} iconColor="#0891b2" />
              <SidebarItem icon={UserCircle} label="LE / REM" count={totals.byOwnerStatus["LE / REM"]} active={ownerStatusFilter.includes("LE / REM")} onClick={() => setOwnerStatusFilter(["LE / REM"])} iconColor="#f59e0b" />
            </div>
            <div className="text-[11px] font-bold tracking-wider mt-8 mb-3" style={{ color: "#64748b" }}>PA TAGS</div>
            <div className="space-y-1">
              <SidebarItem icon={Layers} label="All" count={totals.total} active={paTagFilter.length === 0} onClick={() => setPaTagFilter([])} iconColor="#64748b" />
              <SidebarItem icon={UserCircle} label="Senior" count={totals.byPaTag["Senior"]} active={paTagFilter.includes("Senior")} onClick={() => setPaTagFilter(["Senior"])} iconColor="#0891b2" />
              <SidebarItem icon={UserCircle} label="Widow/Widower ★" count={totals.byPaTag["Widow/Widower"]} active={paTagFilter.includes("Widow/Widower")} onClick={() => setPaTagFilter(["Widow/Widower"])} iconColor="#7c3aed" />
              <SidebarItem icon={Receipt} label="Homestead Penalty ★" count={totals.byPaTag["Homestead Penalty"]} active={paTagFilter.includes("Homestead Penalty")} onClick={() => setPaTagFilter(["Homestead Penalty"])} iconColor="#dc2626" />
            </div>
            <div className="text-[11px] font-bold tracking-wider mt-8 mb-3" style={{ color: "#64748b" }}>ABSENTEE OWNER</div>
            <div className="space-y-1">
              <SidebarItem icon={Layers} label="All" count={totals.total} active={absenteeFilter.length === 0} onClick={() => setAbsenteeFilter([])} iconColor="#64748b" />
              <SidebarItem icon={MapPin} label="Any Absentee" count={totals.byAbsentee.Any} active={absenteeFilter.includes("Any")} onClick={() => setAbsenteeFilter(["Any"])} iconColor="#0891b2" />
              <SidebarItem icon={MapPin} label="Out of Country ★" count={totals.byAbsentee["Out of Country"]} active={absenteeFilter.includes("Out of Country")} onClick={() => setAbsenteeFilter(["Out of Country"])} iconColor="#7c3aed" />
              <SidebarItem icon={MapPin} label="Out of State ★" count={totals.byAbsentee["Out of State"]} active={absenteeFilter.includes("Out of State")} onClick={() => setAbsenteeFilter(["Out of State"])} iconColor="#dc2626" />
              <SidebarItem icon={MapPin} label="In State" count={totals.byAbsentee["In State"]} active={absenteeFilter.includes("In State")} onClick={() => setAbsenteeFilter(["In State"])} iconColor="#f59e0b" />
              <SidebarItem icon={MapPin} label="In County" count={totals.byAbsentee["In County"]} active={absenteeFilter.includes("In County")} onClick={() => setAbsenteeFilter(["In County"])} iconColor="#94a3b8" />
            </div>
            <div className="text-[11px] font-bold tracking-wider mt-8 mb-3" style={{ color: "#64748b" }}>DEED & FINANCIAL EVENTS</div>
            <div className="space-y-1">
              <SidebarItem icon={FileText} label="Possible Partial Int ★" count={totals.possiblePiCount} active={possiblePiFilter} onClick={() => setPossiblePiFilter(!possiblePiFilter)} iconColor="#dc2626" />
              <SidebarItem icon={Receipt} label="Possible PACE ★" count={totals.possiblePaceCount} active={possiblePaceFilter} onClick={() => setPossiblePaceFilter(!possiblePaceFilter)} iconColor="#d97706" />
              <SidebarItem icon={Landmark} label="Reverse Mortgage" count={totals.reverseMortgageCount} active={reverseMortgageFilter} onClick={() => setReverseMortgageFilter(!reverseMortgageFilter)} iconColor="#7c3aed" />
            </div>

            {/* RECENTLY IMPORTED — only render when at least one lead has an importSource */}
            {Object.values(totals.importSourceCounts || {}).some((c) => c > 0) && (
              <>
                <div className="text-[11px] font-bold tracking-wider mt-8 mb-3" style={{ color: "#64748b" }}>RECENTLY IMPORTED</div>
                <div className="space-y-1">
                  {Object.entries(IMPORT_SCHEMAS).map(([key, schema]) => {
                    const count = totals.importSourceCounts?.[key] || 0;
                    if (count === 0) return null;
                    // Compact label for the sidebar — strip parenthetical
                    const shortLabel = schema.label.replace(/\s*\([^)]*\)\s*$/, "");
                    return (
                      <button
                        key={key}
                        onClick={() => setImportSourceFilter(importSourceFilter === key ? null : key)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition"
                        style={{
                          background: importSourceFilter === key ? "#2563eb" : "transparent",
                          color: importSourceFilter === key ? "white" : "#475569",
                        }}
                      >
                        <Upload className="w-3.5 h-3.5 flex-shrink-0" style={{ color: importSourceFilter === key ? "white" : "#64748b" }} />
                        <span className="flex-1 text-left truncate">{shortLabel}</span>
                        <span className="text-[11px] font-bold opacity-80">{fmtCount(count)}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="text-[11px] font-bold tracking-wider mt-8 mb-3" style={{ color: "#64748b" }}>MLS STATUS</div>
            <div className="space-y-1">
              <SidebarItem icon={Layers} label="All" count={totals.total} active={mlsFilter.length === 0 && !activeDomFilter} onClick={() => { setMlsFilter([]); setActiveDomFilter(false); }} iconColor="#64748b" />
              <SidebarItem icon={Flame} label="Expired ★" count={totals.byMls.Expired} active={mlsFilter.includes("Expired") && !activeDomFilter} onClick={() => { setMlsFilter(["Expired"]); setActiveDomFilter(false); }} iconColor="#dc2626" />
              <SidebarItem icon={Flame} label="Canceled ★" count={totals.byMls.Canceled} active={mlsFilter.includes("Canceled") && !activeDomFilter} onClick={() => { setMlsFilter(["Canceled"]); setActiveDomFilter(false); }} iconColor="#dc2626" />
              <SidebarItem icon={TrendingUp} label="Came Back" count={totals.byMls["Came Back"]} active={mlsFilter.includes("Came Back") && !activeDomFilter} onClick={() => { setMlsFilter(["Came Back"]); setActiveDomFilter(false); }} iconColor="#f97316" />
              <SidebarItem icon={Receipt} label="Active" count={totals.byMls.Active} active={mlsFilter.includes("Active") && !activeDomFilter} onClick={() => { setMlsFilter(["Active"]); setActiveDomFilter(false); }} iconColor="#2563eb" />
              <SidebarItem icon={Clock} label="Active DOM 90+ ★" count={totals.byMls["Active DOM 90+"]} active={activeDomFilter} onClick={() => { setActiveDomFilter(!activeDomFilter); setMlsFilter([]); }} iconColor="#ca8a04" />
              <SidebarItem icon={Receipt} label="Pending" count={totals.byMls.Pending} active={mlsFilter.includes("Pending") && !activeDomFilter} onClick={() => { setMlsFilter(["Pending"]); setActiveDomFilter(false); }} iconColor="#7c3aed" />
              <SidebarItem icon={Database} label="Off-Market" count={totals.byMls["Off-Market"]} active={mlsFilter.includes("Off-Market") && !activeDomFilter} onClick={() => { setMlsFilter(["Off-Market"]); setActiveDomFilter(false); }} iconColor="#94a3b8" />
            </div>
          </div>

          {/* MAIN COLUMN */}
          <div className="col-span-12 lg:col-span-10 space-y-6">
            {/* STAT CARDS — clickable; each filters the leads table to its category */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard icon={Phone}    iconColor="#dc2626" value={fmtCount(totals.hotToCall)}        label="HOT TO CALL"          sublabel="≥70 score · no contact 7d+"             onClick={() => handleQuickFilter("hotToCall")}        active={quickFilter === "hotToCall"} />
              <StatCard icon={Clock}    iconColor="#dc2626" value={fmtCount(totals.auctionsImminent)} label="AUCTIONS ≤30 DAYS"    sublabel="urgent — pending auctions"               onClick={() => handleQuickFilter("auctionsImminent")} active={quickFilter === "auctionsImminent"} />
              <StatCard icon={Clock}    iconColor="#ca8a04" value={fmtCount(totals.auctions31to60)}   label="AUCTIONS 31-60 DAYS"  sublabel="warning — plan now"                      onClick={() => handleQuickFilter("auctions31to60")}   active={quickFilter === "auctions31to60"} />
              <StatCard icon={Sparkles} iconColor="#16a34a" value={fmtCount(totals.newThisWeek)}      label="NEW THIS WEEK"        sublabel="filed in last 7 days"                    onClick={() => handleQuickFilter("newThisWeek")}      active={quickFilter === "newThisWeek"} />
              <StatCard icon={Tag}      iconColor="#2563eb" value={fmtCount(totals.newMlsActive)}     label="NEW MLS ACTIVE"       sublabel="listed last week · update CRM, no calls" onClick={() => handleQuickFilter("newMlsActive")}     active={quickFilter === "newMlsActive"} />
              <StatCard icon={Inbox}    iconColor="#7c3aed" value={fmtCount(totals.notInCrm)}         label="NOT IN CRM"           sublabel="needs push to GHL"                       onClick={() => handleQuickFilter("notInCrm")}         active={quickFilter === "notInCrm"} />
            </div>

            {/* SEARCH + FILTERS */}
            <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: "#e2e8f0" }}>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[260px] relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search owner, address, zip, folio, legal..."
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border outline-none text-sm"
                    style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}
                  />
                </div>
                <FilterTab label="All Scores" count={fmtCount(totals.total)} active={activeType.length === 0 && !typeTagIntersection && ownerStatusFilter.length === 0} onClick={() => { setActiveType([]); setTypeTagIntersection(null); setOwnerStatusFilter([]); }} />
                {/* Lead-type pills + their EST OF / Possible EST OF intersections.
                    The fast-action pill row surfaces the most common
                    investigation-worthy types. Other types (Inherited Probate,
                    Inherited QCD, Pre-Foreclosure, Tax Default, lien families)
                    remain available via the sidebar. */}
                {LEAD_TYPES.filter((t) => ["Tax Deed Auction", "Tax Deed", "PFC Auction", "Probate", "Adverse Possession"].includes(t.key)).map((t) => {
                  const baseActive = activeType.includes(t.key) && !typeTagIntersection && ownerStatusFilter.length === 0;
                  const estOfKey = `${t.key} EST OF`;
                  const possEstKey = `${t.key} Possible EST OF`;
                  // Display label shortens "Possible" → "Poss" to keep pill widths
                  // manageable. The canonical key stays "Possible EST OF" since
                  // it's referenced by counts, sidebar nesting, and the filter chain.
                  const possEstLabel = `${t.key} Poss EST OF`;
                  // Intersection pills are data-driven: they only render when the
                  // intersection key is defined in LEAD_TYPE_TAG_INTERSECTIONS.
                  // Probate is intentionally excluded (a probate filing IS an
                  // estate proceeding — "Probate EST OF" would be redundant).
                  const hasEstOf = totals.typeTagIntersectionCounts[estOfKey] !== undefined;
                  const hasPossEst = totals.typeTagIntersectionCounts[possEstKey] !== undefined;
                  const estOfActive = hasEstOf && typeTagIntersection?.type === t.key && typeTagIntersection?.tag === "EST OF";
                  const possEstActive = hasPossEst && typeTagIntersection?.type === t.key && typeTagIntersection?.tag === "Possible EST OF";
                  return (
                    <React.Fragment key={t.key}>
                      <FilterTab label={t.key} count={fmtCount(totals.byType[t.key])} active={baseActive} onClick={() => { setActiveType([t.key]); setTypeTagIntersection(null); setOwnerStatusFilter([]); }} color={t.color} />
                      {hasEstOf && <FilterTab label={estOfKey} count={fmtCount(totals.typeTagIntersectionCounts[estOfKey])} active={estOfActive} onClick={() => { setTypeTagIntersection({ type: t.key, tag: "EST OF" }); setActiveType([]); setOwnerStatusFilter([]); }} color={t.color} />}
                      {hasPossEst && <FilterTab label={possEstLabel} count={fmtCount(totals.typeTagIntersectionCounts[possEstKey])} active={possEstActive} onClick={() => { setTypeTagIntersection({ type: t.key, tag: "Possible EST OF" }); setActiveType([]); setOwnerStatusFilter([]); }} color={t.color} />}
                    </React.Fragment>
                  );
                })}
                <button
                  onClick={() => setShowFilterPanel(true)}
                  title={activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} active — click to manage` : "Open filter panel to stack multiple filters"}
                  className="px-3 py-2.5 rounded-lg border bg-white text-sm flex items-center gap-2 transition hover:bg-slate-50"
                  style={{
                    borderColor: activeFilterCount > 0 ? "#2563eb" : "#e2e8f0",
                    color: activeFilterCount > 0 ? "#2563eb" : "#334155",
                    background: activeFilterCount > 0 ? "#eff6ff" : "white",
                  }}
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: "#2563eb", color: "white" }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* RESULTS COUNT */}
            <div className="text-sm" style={{ color: "#475569" }}>
              Showing <span className="font-bold">{fmtCount(filtered.length)}</span> of <span className="font-bold">{fmtCount(recognizedLeads.length)}</span> records
            </div>

            {/* DATA TABLE */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
              <div className="overflow-auto max-h-[70vh]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] font-bold tracking-wider" style={{ color: "white", borderBottom: "1px solid #1e40af" }}>
                      {(() => {
                        // Render a sortable column header. Active column shows its current
                        // direction; inactive sortable columns show a faded ↕ to signal
                        // sortability. Non-sortable columns get no indicator.
                        const SortableTh = ({ label, field, pad = "px-4" }) => {
                          const isActive = sortField === field;
                          const arrow = isActive ? (sortDir === "asc" ? "↑" : "↓") : "↕";
                          return (
                            <th onClick={() => handleSort(field)} className={`text-left ${pad} py-3 sticky top-0 z-10 cursor-pointer select-none transition`} style={{ background: isActive ? "#1e40af" : "#2563eb" }} title={`Sort by ${label} (currently ${isActive ? sortDir : "not sorted"})`}>
                              <span className="inline-flex items-center gap-1.5">
                                {label}
                                <span className={isActive ? "opacity-100" : "opacity-40"}>{arrow}</span>
                              </span>
                            </th>
                          );
                        };
                        const NonSortableTh = ({ label, pad = "px-4" }) => (
                          <th className={`text-left ${pad} py-3 sticky top-0 z-10`} style={{ background: "#2563eb" }}>{label}</th>
                        );
                        return (
                          <>
                            <NonSortableTh label="PROP LINK" />
                            <SortableTh   label="LEAD SCORE" field="score" />
                            <SortableTh   label="COND SCORE" field="badConditionScore" />
                            <SortableTh   label="LEAD STACK" field="stackCount" pad="px-2" />
                            <SortableTh   label="LIST TYPE" field="type" />
                            <SortableTh   label="LIEN AMOUNT" field="amount" />
                            <SortableTh   label="EQUITY APPROX (%)" field="equityApproxAmount" />
                            <SortableTh   label="FILED DATE" field="filed" />
                            <SortableTh   label="AUCTION DATE" field="auctionDate" />
                            <NonSortableTh label="FLAGS / TAGS" />
                            <SortableTh   label="OWNER / GRANTOR" field="owner" />
                            <SortableTh   label="PROPERTY ADDRESS" field="propertyAddress" />
                            <SortableTh   label="MAILING ADDRESS" field="mailingCity" pad="px-2" />
                            <SortableTh   label="PROP TYPE" field="propertyType" pad="px-3" />
                            <SortableTh   label="IN CRM" field="inCrm" pad="px-2" />
                          </>
                        );
                      })()}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r) => (
                      <tr key={r.id} className="cursor-pointer transition hover:bg-slate-50" onClick={() => setSelectedLead(r)} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-1.5">
                            <a onClick={(e) => e.stopPropagation()} href={buildPaUrl(r)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-xs hover:underline" style={{ color: "#2563eb" }} title="Property Appraiser — deep-linked to this folio">
                              PA <ExternalLink className="w-3 h-3" />
                            </a>
                            <a onClick={(e) => e.stopPropagation()} href={buildSearchUrl(r)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-xs hover:underline" style={{ color: "#0891b2" }} title="Web search for this address — opens a Google search page showing a Street View thumbnail (1 click to enter Street View), Zillow as a top result, plus Redfin, Trulia, Realtor.com, and county records when available. Single landing page for all external property research.">
                              <Search className="w-3 h-3" /> Web
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span className="inline-flex items-center justify-center w-11 h-7 rounded-md text-white font-bold text-xs" style={{ background: scoreColor(r.score) }}>
                            {r.score}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          {(() => {
                            const cs = r.badConditionScore || 0;
                            // Color tier mirrors urgency conventions: red ≥60, orange 40-59,
                            // amber 20-39, slate 1-19, transparent 0. The badge uses solid fill
                            // for non-zero scores (so it pops at scan speed) and an outline-only
                            // pill at zero (so it doesn't visually compete with other signals).
                            const csColor =
                              cs >= 60 ? "#dc2626" :
                              cs >= 40 ? "#ea580c" :
                              cs >= 20 ? "#ca8a04" :
                              cs > 0   ? "#64748b" :
                                         "#cbd5e1";
                            const csBg = cs > 0 ? csColor : "transparent";
                            const txtColor = cs > 0 ? "white" : "#94a3b8";
                            return (
                              <span className="inline-flex items-center justify-center w-11 h-7 rounded-md font-bold text-xs" style={{ background: csBg, color: txtColor, border: cs === 0 ? "1px solid #e2e8f0" : "none" }} title={`Bad Condition Score: ${cs}/100`}>
                                {cs}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-2 py-4 align-top">
                          {(() => {
                            const sc = r.stackCount || 0;
                            // Color tier: 0=gray, 1-2=neutral, 3+=colored ("stacked" threshold)
                            const stackColor = sc >= 5 ? "#dc2626" : sc >= 3 ? "#ca8a04" : sc >= 1 ? "#475569" : "#cbd5e1";
                            const bg = sc >= 5 ? "#fee2e2" : sc >= 3 ? "#fef9c3" : sc >= 1 ? "#f1f5f9" : "transparent";
                            return (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold" style={{ background: bg, color: stackColor }} title={`${sc} stacked motivation signal${sc === 1 ? "" : "s"}`}>
                                {sc}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="inline-flex items-center gap-1.5 font-bold text-xs" style={{ color: TYPE_COLOR[getPrimaryLeadType(r)] || "#475569" }}>
                            <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLOR[getPrimaryLeadType(r)] || "#475569" }}></span>
                            {(getPrimaryLeadType(r) || "—").toUpperCase()}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          {r.soldAt ? (
                            <div>
                              <div className="font-bold text-[13px]" style={{ color: "#16a34a" }}>{fmtMoney(r.soldPrice)}</div>
                              <div className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>sold {r.soldAt}</div>
                            </div>
                          ) : (
                            <span className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{r.amount > 0 ? fmtMoney(r.amount) : "—"}</span>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top">
                          {(() => {
                            const amount = r.equityApproxAmount;
                            if (amount == null) return <span className="text-[11px]" style={{ color: "#cbd5e1" }}>—</span>;
                            // Color matches the underlying tier so visual scanning still works
                            const cfg = {
                              "VERY HIGH": { color: "#15803d", bg: "#dcfce7", border: "#bbf7d0" },
                              "HIGH":      { color: "#16a34a", bg: "#dcfce7", border: "#bbf7d0" },
                              "MEDIUM":    { color: "#ca8a04", bg: "#fef9c3", border: "#fde68a" },
                              "LOW":       { color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" },
                            }[r.equity] || { color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" };
                            // Equity % is the tier ratio expressed as a percentage. By construction
                            // in deriveApproxEquity, equityApproxAmount = marketValue × EQUITY_TIER_RATIO[tier],
                            // so the percentage is just the constant multiplied by 100. This avoids
                            // needing to know which market-value source (paTotalValue / mlsListPrice /
                            // lastSalePrice) deriveApproxEquity actually used.
                            const ratio = EQUITY_TIER_RATIO[r.equity];
                            const equityPct = ratio != null ? Math.round(ratio * 100) : null;
                            const tooltip = `Tier: ${r.equity} · approximate only`;
                            return (
                              <span className="inline-flex flex-col items-start px-2 py-0.5 rounded text-xs font-bold tracking-wide leading-tight" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }} title={tooltip}>
                                {equityPct != null && <span>~{equityPct}%</span>}
                                <span className="opacity-75 text-[10px] font-medium">~{fmtCompactMoney(amount)}</span>
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-4 align-top text-xs" style={{ color: "#475569" }}>{r.filed}</td>
                        <td className="px-4 py-4 align-top">
                          {(() => {
                            const ad = r.auctionData;
                            if (!ad?.auctionDate) {
                              return <span className="text-[11px]" style={{ color: "#cbd5e1" }}>—</span>;
                            }
                            // Completed auctions show outcome label
                            if (ad.outcome) {
                              const outMeta = {
                                cancelled_bk:     { label: "CANCELLED · BK",     color: "#14532d", bg: "#bbf7d0", border: "#86efac" },
                                cancelled_county: { label: "CANCELLED · COUNTY", color: "#14532d", bg: "#bbf7d0", border: "#86efac" },
                                buyer_walked:     { label: "BUYER WALKED",       color: "#14532d", bg: "#bbf7d0", border: "#86efac" },
                                redeemed:         { label: "REDEEMED",           color: "#92400e", bg: "#fef3c7", border: "#fde68a" },
                                sold:             { label: "SOLD",               color: "#991b1b", bg: "#fee2e2", border: "#fecaca" },
                              }[ad.outcome] || { label: ad.outcome.toUpperCase(), color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" };
                              return (
                                <div>
                                  <div className="text-[12px] font-medium" style={{ color: "#475569" }}>{ad.auctionDate}</div>
                                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: outMeta.bg, color: outMeta.color, border: `1px solid ${outMeta.border}` }}>
                                    {outMeta.label}
                                  </span>
                                </div>
                              );
                            }
                            // Pending auctions show date + urgency tier
                            const days = daysUntilAuction(ad.auctionDate);
                            if (days === null || days < 0) {
                              return <span className="text-[12px]" style={{ color: "#475569" }}>{ad.auctionDate}</span>;
                            }
                            const tier =
                              days <= 30 ? { color: "#dc2626", bg: "#fee2e2", border: "#fecaca", label: `${days}d` } :
                              days <= 60 ? { color: "#ca8a04", bg: "#fef9c3", border: "#fde68a", label: `${days}d` } :
                                           { color: "#2563eb", bg: "#dbeafe", border: "#bfdbfe", label: `${days}d` };
                            return (
                              <div>
                                <div className="text-[12px] font-bold" style={{ color: tier.color }}>{ad.auctionDate}</div>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>
                                  {days <= 30 && "⏰ "}{tier.label}
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-1">
                            {r.soldAt && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                borderColor: DEED_TYPES[r.soldDeedType]?.color || "#16a34a",
                                background: `${DEED_TYPES[r.soldDeedType]?.color || "#16a34a"}15`,
                                color: DEED_TYPES[r.soldDeedType]?.color || "#16a34a",
                              }}>
                                ✓ SOLD · {r.soldDeedType}
                              </span>
                            )}
                            {r.possiblePi && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                borderColor: "#dc2626",
                                background: "#fee2e2",
                                color: "#991b1b",
                              }} title={`Partial-interest sale to ${r.possiblePi.buyerEntity} for ${fmtMoney(r.possiblePi.soldPrice)} on ${r.possiblePi.soldDate}`}>
                                POSS PI
                              </span>
                            )}
                            {r.possiblePace && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                borderColor: "#d97706",
                                background: "#fef3c7",
                                color: "#92400e",
                              }} title={`Tax jumped from ${fmtMoney(r.possiblePace.priorYearTax)} to ${fmtMoney(r.possiblePace.jumpYearTax)} in ${r.possiblePace.jumpYear} (${r.possiblePace.multiplier.toFixed(1)}x)`}>
                                Poss PACE
                              </span>
                            )}
                            {r.reverseMortgage && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                borderColor: "#7c3aed",
                                background: "#ede9fe",
                                color: "#5b21b6",
                              }} title={`Reverse mortgage from ${r.reverseMortgage.lender}, recorded ${r.reverseMortgage.recordedDate}`}>
                                ⟲ RM
                              </span>
                            )}
                            {r.codeViolationsSummary?.activeCount > 0 && (() => {
                              const activeCats = r.codeViolationsSummary.activeCategories || [];
                              if (activeCats.length === 0) return null;
                              const topCat = VIOLATION_CATEGORIES.find((c) => activeCats.includes(c.key));
                              const cat = topCat || { color: "#dc2626", bgColor: "#fee2e2", borderColor: "#fca5a5", shortLabel: "NOV", label: "Violation" };
                              const otherTags = activeCats.length - 1;
                              const allLabels = activeCats.map((k) => {
                                const c = VIOLATION_CATEGORIES.find((cc) => cc.key === k);
                                return c ? c.label : k;
                              }).join(", ");
                              return (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit flex items-center gap-1" style={{
                                  borderColor: cat.borderColor,
                                  background: cat.bgColor,
                                  color: cat.color,
                                }} title={`Tags: ${allLabels} · ${r.codeViolationsSummary.activeCount} active violation${r.codeViolationsSummary.activeCount > 1 ? "s" : ""} · ${fmtMoney(r.codeViolationsSummary.totalFines)} fines`}>
                                  {cat.shortLabel.toUpperCase()}
                                  {otherTags > 0 && <span className="opacity-75">+{otherTags}</span>}
                                </span>
                              );
                            })()}
                            {r.auctionData?.verdict && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                borderColor: r.auctionData.color,
                                background: `${r.auctionData.color}15`,
                                color: r.auctionData.color,
                              }} title={`FJ ${fmtMoney(r.auctionData.finalJudgment)} · PA ${fmtMoney(r.auctionData.paTotalValue)}`}>
                                {r.auctionData.verdict}
                                {r.auctionData.fjVsPaPct != null && (
                                  <span className="ml-1 font-mono" style={{ opacity: 0.85 }}>· FJ/PA {r.auctionData.fjVsPaPct.toFixed(0)}%</span>
                                )}
                              </span>
                            )}
                            {(() => {
                              const d = daysUntilAuction(r.auctionData?.auctionDate);
                              if (d === null) return null;
                              if (d < 0) return null;
                              const urgent = d <= 30;
                              const veryUrgent = d <= 7;
                              return (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                  borderColor: veryUrgent ? "#991b1b" : urgent ? "#dc2626" : "#94a3b8",
                                  background: veryUrgent ? "#fee2e2" : urgent ? "#fef2f2" : "#f1f5f9",
                                  color: veryUrgent ? "#991b1b" : urgent ? "#dc2626" : "#475569",
                                }} title={`Auction ${r.auctionData.auctionDate}`}>
                                  AUCTION {d}d
                                </span>
                              );
                            })()}
                            {(r.paTags || []).includes("Widow/Widower") && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                borderColor: "#7c3aed",
                                background: "#ede9fe",
                                color: "#5b21b6",
                              }} title="Florida Widow's/Widower's Exemption (§196.202)">
                                WIDOW
                              </span>
                            )}
                            {(r.paTags || []).includes("Senior") && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                borderColor: "#0891b2",
                                background: "#cffafe",
                                color: "#155e75",
                              }} title="Florida Senior Exemption (§196.075) — owner is 65+">
                                SENIOR
                              </span>
                            )}
                            {(r.paTags || []).includes("Adverse Possession") && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                borderColor: "#16a34a",
                                background: "#dcfce7",
                                color: "#15803d",
                              }} title="Adverse possession claim in Legal1 — specialty title-clearance opportunity">
                                ADV POSS
                              </span>
                            )}
                            {hasListType(r, "Deceased") && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                borderColor: "#16a34a",
                                background: "#dcfce7",
                                color: "#15803d",
                              }} title={r.estateReason}>
                                EST OF
                              </span>
                            )}
                            {hasListType(r, "Deceased/2nd Owner") && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                borderColor: "#7c3aed",
                                background: "#ede9fe",
                                color: "#5b21b6",
                              }} title={r.estateReason}>
                                EST OF 2ND
                              </span>
                            )}
                            {hasListType(r, "LE / REM") && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                borderColor: "#f59e0b",
                                background: "#fef3c7",
                                color: "#92400e",
                              }} title={r.estateReason}>
                                LE / REM
                              </span>
                            )}
                            {hasListType(r, "Possible Deceased") && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                borderColor: "#0891b2",
                                background: "#cffafe",
                                color: "#155e75",
                              }} title={r.estateReason}>
                                POSS EST OF
                              </span>
                            )}
                            {(hasListType(r, "Inherited Probate") || hasListType(r, "Inherited QCD")) && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                borderColor: "#0891b2",
                                background: "#cffafe",
                                color: "#155e75",
                              }}>
                                INHERITED
                              </span>
                            )}
                            {r.mlsStatus && r.mlsStatus !== "Off-Market" && !r.soldAt && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit" style={{
                                borderColor: MLS_STATUS_BY_KEY[r.mlsStatus].color,
                                background: `${MLS_STATUS_BY_KEY[r.mlsStatus].color}15`,
                                color: MLS_STATUS_BY_KEY[r.mlsStatus].color,
                              }}>
                                MLS {r.mlsStatus === "Expired" ? "EXP" : r.mlsStatus === "Came Back" ? "BACK" : r.mlsStatus.toUpperCase()}
                              </span>
                            )}
                            {r.badConditionScore > 0 && (() => {
                              const topTag = r.conditionTags?.[0];
                              const tagDef = BAD_CONDITION_TAGS.find((t) => t.key === topTag);
                              if (!tagDef) return null;
                              return (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold border w-fit flex items-center gap-1" style={{
                                  borderColor: tagDef.borderColor,
                                  background: tagDef.bgColor,
                                  color: tagDef.color,
                                }} title={`Bad Condition Score: ${r.badConditionScore}/100 · ${r.conditionTags.join(", ")}`}>
                                  {tagDef.label.toUpperCase()} · {r.badConditionScore}
                                </span>
                              );
                            })()}
                            {r.flags.filter((f) => !f.startsWith("MLS ") && !f.startsWith("Absentee") && f !== "Came back to market" && f !== "Inherited" && f !== "EST OF" && f !== "Possible EST OF" && f !== "EST OF 2nd Owner" && f !== "LE / REM" && f !== "Senior" && f !== "Widow/Widower" && f !== "Homestead Penalty" && f !== "Adverse Possession" && f !== "Possible Partial Interest" && f !== "Possible PACE" && f !== "Reverse Mortgage" && f !== "Code Violations" && !BAD_CONDITION_KEYS.includes(f)).slice(0, 4).map((f, i) => (
                              <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium border w-fit" style={{
                                borderColor: f === "STACKED" ? "#bfdbfe" : "#e2e8f0",
                                background: f === "STACKED" ? "#dbeafe" : "#f8fafc",
                                color: f === "STACKED" ? "#1e40af" : "#475569"
                              }}>{f}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{r.owner}</div>
                          {r.via && <div className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>via: {r.via}</div>}
                          {r.equity && (
                            <div className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold" style={{
                              background: r.equity === "HIGH" ? "#dcfce7" : r.equity === "MEDIUM" ? "#fef3c7" : "#fee2e2",
                              color: r.equity === "HIGH" ? "#166534" : r.equity === "MEDIUM" ? "#854d0e" : "#991b1b"
                            }}>{r.equity}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="font-medium text-[13px]" style={{ color: "#0f172a" }}>{r.propertyAddress}</div>
                          <div className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>{r.propertyCity}</div>
                        </td>
                        <td className="px-2 py-4 align-top">
                          {(() => {
                            // Compact mailing badge: "📍 Same" if mailing matches property,
                            // otherwise show the city portion of the mailing address.
                            const sameAddr = r.mailingAddress && r.propertyAddress &&
                              r.mailingAddress.trim().toUpperCase() === r.propertyAddress.trim().toUpperCase();
                            if (sameAddr) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }} title={`Mailing: ${r.mailingAddress}, ${r.mailingCity}`}>
                                  📍 Same
                                </span>
                              );
                            }
                            // Different mailing — show city + state, with absentee-tier color hint
                            const tierColors = {
                              "Out of Country": { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
                              "Out of State":   { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
                              "In State":       { bg: "#fefce8", color: "#854d0e", border: "#fef08a" },
                              "In County":      { bg: "#f0f9ff", color: "#075985", border: "#bae6fd" },
                            };
                            const tc = tierColors[r.absenteeTier] || { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };
                            // Extract just "CITY, ST" from mailingCity
                            const cityShort = (r.mailingCity || "").split(",").slice(0, 2).join(",").replace(/\s+\d{5}.*$/, "").trim();
                            return (
                              <span className="inline-flex flex-col px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }} title={`Mailing: ${r.mailingAddress}, ${r.mailingCity}`}>
                                {cityShort || "Different"}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-4 align-top">
                          {(() => {
                            const pt = PROPERTY_TYPE_BY_KEY[r.propertyType];
                            if (!pt) return <span className="text-[11px]" style={{ color: "#cbd5e1" }}>—</span>;
                            return (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide" style={{ background: `${pt.color}15`, color: pt.color, border: `1px solid ${pt.color}30` }}>
                                {pt.key.toUpperCase()}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-2 py-4 align-top">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAllLeads((prev) => prev.map((l) => l.id === r.id ? { ...l, inCrm: !l.inCrm } : l));
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer"
                            style={{
                              background: r.inCrm ? "#dcfce7" : "#f8fafc",
                              color: r.inCrm ? "#15803d" : "#94a3b8",
                              borderColor: r.inCrm ? "#86efac" : "#e2e8f0",
                            }}
                            title={r.inCrm ? "In CRM — click to mark as NOT in CRM" : "Not in CRM — click to mark as IN CRM"}
                          >
                            {r.inCrm ? "✓ YES" : "NO"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pageRows.length === 0 && (
                      <tr><td colSpan={11} className="text-center py-12" style={{ color: "#94a3b8" }}>No records match the current filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* PAGINATION */}
              <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
                <div className="flex items-center gap-2 text-sm" style={{ color: "#475569" }}>
                  Rows per page: <span className="font-bold">{pageSize}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(Math.max(1, page - 1))} className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-slate-200" style={{ color: "#475569" }}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {[...Array(Math.min(3, totalPages))].map((_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} onClick={() => setPage(p)} className="w-8 h-8 rounded-md font-medium text-sm" style={{
                        background: page === p ? "#2563eb" : "transparent",
                        color: page === p ? "white" : "#475569"
                      }}>{p}</button>
                    );
                  })}
                  {totalPages > 3 && <span className="px-2" style={{ color: "#94a3b8" }}>...</span>}
                  {totalPages > 3 && (
                    <button onClick={() => setPage(totalPages)} className="w-12 h-8 rounded-md font-medium text-sm" style={{ color: page === totalPages ? "white" : "#475569", background: page === totalPages ? "#2563eb" : "transparent" }}>{totalPages}</button>
                  )}
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-slate-200" style={{ color: "#475569" }}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {selectedLead && (() => {
        // Always read the live lead from allLeads so updates (Manual Marks,
        // notes, IN CRM toggle, auction outcome edits, etc.) reflect immediately
        // in the open modal. Falls back to the original selection snapshot if
        // the lead was somehow removed from state.
        const liveLead = allLeads.find((l) => l.id === selectedLead.id) || selectedLead;
        return <LeadDetailModal lead={liveLead} onClose={() => setSelectedLead(null)} onComp={() => setShowCompTool(true)} onCalc={() => setShowCalculator(true)} setAllLeads={setAllLeads} codeViolationsApi={codeViolationsApi} codeViolationsCache={codeViolationsCache} updateCodeViolationsCache={updateCodeViolationsCache} />;
      })()}
      {showCalculator && <DealCalculatorModal initialLead={selectedLead} initialArv={arvFromComps} onClose={() => { setShowCalculator(false); setArvFromComps(null); }} />}
      {showCompTool && <CompToolModal lead={selectedLead} onClose={() => setShowCompTool(false)} onUseArv={(arv) => { setArvFromComps(arv); setShowCompTool(false); setShowCalculator(true); }} />}

      {/*
       * FILTER STACK PANEL
       * Multi-dimensional filter composer. Reads and writes the same filter
       * state used by the sidebar, so toggles here stay in sync with sidebar
       * counts. Each section is one filter dimension; chips inside are mutually
       * exclusive (radio-style) for "All / specific value" filters and toggle-style
       * for boolean filters (signals).
       */}
      {showFilterPanel && (() => {
        // Reusable chip component scoped inside the modal via IIFE so it doesn't
        // leak into the parent component closure.
        const Chip = ({ active, onClick, label, color }) => (
          <button
            onClick={onClick}
            className="px-2.5 py-1 rounded-full text-xs font-medium border transition"
            style={{
              background: active ? (color || "#2563eb") : "white",
              color: active ? "white" : "#475569",
              borderColor: active ? (color || "#2563eb") : "#e2e8f0",
            }}
          >
            {label}
          </button>
        );
        const Section = ({ title, children }) => (
          <div className="mb-5">
            <div className="text-[11px] font-bold tracking-wider mb-2" style={{ color: "#64748b" }}>{title}</div>
            <div className="flex flex-wrap gap-1.5">{children}</div>
          </div>
        );
        return (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-6 overflow-y-auto" style={{ background: "rgba(15,23,42,0.6)" }} onClick={() => setShowFilterPanel(false)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5" style={{ color: "#2563eb" }} />
                  <div>
                    <div className="font-bold text-lg" style={{ color: "#0f172a" }}>Stack filters</div>
                    <div className="text-xs" style={{ color: "#64748b" }}>
                      {activeFilterCount === 0 ? "No filters active — pick any combination below" :
                       `${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} active — narrowed to ${fmtCount(filtered.length)} of ${fmtCount(recognizedLeads.length)} leads`}
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowFilterPanel(false)} className="p-2 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" style={{ color: "#64748b" }} />
                </button>
              </div>

              {/* Filter sections */}
              <div className="p-5 max-h-[70vh] overflow-y-auto">
                <div className="mb-4 px-3 py-2 rounded-lg text-xs" style={{ background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>
                  <strong>Multi-select:</strong> click multiple chips in the same section to stack them (OR logic). For example, click both "Hot ≥70" and "Warm 50-69" to see leads in either band. The "Any" chip clears that section.
                </div>

                <Section title="SCORE">
                  <Chip active={scoreFilter.length === 0} onClick={() => setScoreFilter([])} label="Any" />
                  <Chip active={scoreFilter.includes("Hot")}    onClick={() => toggleArrFilter(setScoreFilter, "Hot")}    label="Hot ≥70" color="#dc2626" />
                  <Chip active={scoreFilter.includes("Warm")}   onClick={() => toggleArrFilter(setScoreFilter, "Warm")}   label="Warm 50-69" color="#f59e0b" />
                  <Chip active={scoreFilter.includes("Cold")}   onClick={() => toggleArrFilter(setScoreFilter, "Cold")}   label="Cold <50" color="#0891b2" />
                  <Chip active={scoreFilter.includes("Active")} onClick={() => toggleArrFilter(setScoreFilter, "Active")} label="Active ≥30" color="#16a34a" />
                </Section>

                <Section title="LEAD TYPE">
                  <Chip active={activeType.length === 0} onClick={() => setActiveType([])} label="Any" />
                  {LEAD_TYPES.map((t) => (
                    <Chip key={t.key} active={activeType.includes(t.key)} onClick={() => toggleArrFilter(setActiveType, t.key)} label={t.key} color={t.color} />
                  ))}
                </Section>

                <Section title="OWNER STATUS">
                  <Chip active={ownerStatusFilter.length === 0} onClick={() => setOwnerStatusFilter([])} label="Any" />
                  <Chip active={ownerStatusFilter.includes("Deceased")}           onClick={() => toggleArrFilter(setOwnerStatusFilter, "Deceased")}           label="Deceased" color="#16a34a" />
                  <Chip active={ownerStatusFilter.includes("Deceased/2nd Owner")} onClick={() => toggleArrFilter(setOwnerStatusFilter, "Deceased/2nd Owner")} label="Deceased/2nd Owner" color="#7c3aed" />
                  <Chip active={ownerStatusFilter.includes("Possible Deceased")}  onClick={() => toggleArrFilter(setOwnerStatusFilter, "Possible Deceased")}  label="Possible Deceased" color="#0891b2" />
                  <Chip active={ownerStatusFilter.includes("LE / REM")}         onClick={() => toggleArrFilter(setOwnerStatusFilter, "LE / REM")}         label="LE / REM" color="#f59e0b" />
                </Section>

                <Section title="ABSENTEE OWNER">
                  <Chip active={absenteeFilter.length === 0} onClick={() => setAbsenteeFilter([])} label="Any" />
                  <Chip active={absenteeFilter.includes("Out of Country")} onClick={() => toggleArrFilter(setAbsenteeFilter, "Out of Country")} label="Out of Country" color="#dc2626" />
                  <Chip active={absenteeFilter.includes("Out of State")}   onClick={() => toggleArrFilter(setAbsenteeFilter, "Out of State")}   label="Out of State" color="#ea580c" />
                  <Chip active={absenteeFilter.includes("In State")}       onClick={() => toggleArrFilter(setAbsenteeFilter, "In State")}       label="In State" color="#ca8a04" />
                  <Chip active={absenteeFilter.includes("In County")}      onClick={() => toggleArrFilter(setAbsenteeFilter, "In County")}      label="In County" color="#0891b2" />
                </Section>

                <Section title="PA TAGS">
                  <Chip active={paTagFilter.length === 0} onClick={() => setPaTagFilter([])} label="Any" />
                  <Chip active={paTagFilter.includes("Senior")}            onClick={() => toggleArrFilter(setPaTagFilter, "Senior")}            label="Senior" color="#16a34a" />
                  <Chip active={paTagFilter.includes("Widow/Widower")}     onClick={() => toggleArrFilter(setPaTagFilter, "Widow/Widower")}     label="Widow/Widower" color="#7c3aed" />
                  <Chip active={paTagFilter.includes("Homestead Penalty")} onClick={() => toggleArrFilter(setPaTagFilter, "Homestead Penalty")} label="Homestead Penalty" color="#dc2626" />
                </Section>

                <Section title="SIGNALS (each toggles independently)">
                  <Chip active={possiblePiFilter}      onClick={() => setPossiblePiFilter(!possiblePiFilter)}           label="Possible Partial Int" color="#dc2626" />
                  <Chip active={possiblePaceFilter}    onClick={() => setPossiblePaceFilter(!possiblePaceFilter)}       label="Possible PACE" color="#d97706" />
                  <Chip active={reverseMortgageFilter} onClick={() => setReverseMortgageFilter(!reverseMortgageFilter)} label="Reverse Mortgage" color="#7c3aed" />
                  <Chip active={codeViolationsFilter}  onClick={() => setCodeViolationsFilter(!codeViolationsFilter)}   label="Code Violations" color="#dc2626" />
                </Section>

                <Section title="AUCTION (verdict is exclusive; urgency tiers stack)">
                  <Chip active={verdictFilter === "All"}    onClick={() => setVerdictFilter("All")}    label="Any verdict" />
                  <Chip active={verdictFilter === "PURSUE"} onClick={() => setVerdictFilter("PURSUE")} label="PURSUE" color="#16a34a" />
                  <Chip active={verdictFilter === "PASS"}   onClick={() => setVerdictFilter("PASS")}   label="PASS" color="#dc2626" />
                  <span className="mx-2 self-center" style={{ color: "#cbd5e1" }}>|</span>
                  <Chip active={auctionUrgencyFilter.length === 0}      onClick={() => setAuctionUrgencyFilter([])}                       label="Any urgency" />
                  <Chip active={auctionUrgencyFilter.includes("lte30")}  onClick={() => toggleArrFilter(setAuctionUrgencyFilter, "lte30")}  label="≤ 30 days" color="#dc2626" />
                  <Chip active={auctionUrgencyFilter.includes("31to60")} onClick={() => toggleArrFilter(setAuctionUrgencyFilter, "31to60")} label="31-60 days" color="#ca8a04" />
                  <Chip active={auctionUrgencyFilter.includes("gte61")}  onClick={() => toggleArrFilter(setAuctionUrgencyFilter, "gte61")}  label="61+ days" color="#2563eb" />
                </Section>

                <Section title="MLS STATUS">
                  <Chip active={mlsFilter.length === 0} onClick={() => setMlsFilter([])} label="Any" />
                  <Chip active={mlsFilter.includes("Expired")}    onClick={() => toggleArrFilter(setMlsFilter, "Expired")}    label="Expired" color="#dc2626" />
                  <Chip active={mlsFilter.includes("Canceled")}   onClick={() => toggleArrFilter(setMlsFilter, "Canceled")}   label="Canceled" color="#dc2626" />
                  <Chip active={mlsFilter.includes("Came Back")}  onClick={() => toggleArrFilter(setMlsFilter, "Came Back")}  label="Came Back" color="#f97316" />
                  <Chip active={mlsFilter.includes("Active")}     onClick={() => toggleArrFilter(setMlsFilter, "Active")}     label="Active" color="#2563eb" />
                  <Chip active={mlsFilter.includes("Pending")}    onClick={() => toggleArrFilter(setMlsFilter, "Pending")}    label="Pending" color="#7c3aed" />
                  <Chip active={mlsFilter.includes("Off-Market")} onClick={() => toggleArrFilter(setMlsFilter, "Off-Market")} label="Off-Market" color="#94a3b8" />
                </Section>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
                <button
                  onClick={clearAllFilters}
                  disabled={activeFilterCount === 0}
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition disabled:cursor-default"
                  style={{
                    borderColor: activeFilterCount > 0 ? "#fecaca" : "#e2e8f0",
                    color: activeFilterCount > 0 ? "#dc2626" : "#cbd5e1",
                    background: activeFilterCount > 0 ? "#fef2f2" : "white",
                  }}
                >
                  Clear all filters
                </button>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: "#2563eb" }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {showImportInfo && <ImportInfoModal onClose={() => setShowImportInfo(false)} />}
      {showAlerts && (
        <AlertsInboxModal
          alerts={alerts}
          leads={recognizedLeads}
          onClose={() => setShowAlerts(false)}
          onMarkRead={markAlertRead}
          onMarkAllRead={markAllAlertsRead}
          onOpenLead={(leadId) => {
            const l = recognizedLeads.find((x) => x.id === leadId);
            if (l) {
              setSelectedLead(l);
              setShowAlerts(false);
            }
          }}
          onOpenSettings={() => { setShowAlerts(false); setShowAlertSettings(true); }}
        />
      )}
      {showAlertSettings && (
        <AlertSettingsModal
          prefs={alertPrefs}
          onChangePrefs={setAlertPrefs}
          quietHours={quietHours}
          onChangeQuietHours={setQuietHours}
          onClose={() => setShowAlertSettings(false)}
          onOpenGhl={() => { setShowAlertSettings(false); setShowGhlSettings(true); }}
        />
      )}
      {showGhlSettings && (
        <GhlSettingsModal
          webhooks={ghlWebhooks}
          onChangeWebhooks={setGhlWebhooks}
          activity={ghlActivity}
          onClose={() => setShowGhlSettings(false)}
          onTestWebhook={async (eventType, lead) => {
            const url = ghlWebhooks[eventType];
            if (!url) { alert("Add a webhook URL first."); return; }
            const sampleLead = lead || recognizedLeads[0];
            if (!sampleLead) { alert("No leads available to test with."); return; }
            const result = await postToGhl(
              url,
              buildGhlPayload(sampleLead, { source: "test_ping", eventType }),
              { eventType: `${eventType} (test)`, leadId: sampleLead.id, leadAddress: sampleLead.propertyAddress }
            );
            if (result?.error) alert(`Test failed: ${result.error}`);
            else alert(`Test sent · ${result?.response || "see Activity Log"}`);
          }}
        />
      )}
      {showCodeViolationsApi && (
        <CodeViolationsApiModal
          config={codeViolationsApi}
          onChange={setCodeViolationsApi}
          onClose={() => setShowCodeViolationsApi(false)}
          onClearCache={() => setCodeViolationsCache({})}
          onTest={async (folio) => {
            const testFolio = folio || recognizedLeads[0]?.folio || "0123456789";
            const result = await fetchCodeViolations(testFolio, codeViolationsApi);
            return result;
          }}
          totalLeads={recognizedLeads.filter((l) => !l.soldAt).length}
          onBatchFetch={async (onProgress, abortSignal) => {
            const targetLeads = recognizedLeads.filter((l) => !l.soldAt && l.folio);
            const folios = targetLeads.map((l) => l.folio);
            const batchResult = await fetchCodeViolationsBatch(folios, codeViolationsApi, onProgress, abortSignal);
            // Apply each result through the cache updater so score boosts + flags are applied consistently
            for (const [folioNorm, result] of batchResult.results.entries()) {
              if (result.violations.length > 0 || result.error) {
                updateCodeViolationsCache(folioNorm, result);
              }
            }
            return batchResult;
          }}
        />
      )}
      {showImportModal && (
        <ImportModal
          existingLeads={recognizedLeads}
          codeViolationsApi={codeViolationsApi}
          onApplyImport={({ updates, inserts, ghlRefresh, matchedLeadIds }) => {
            // GHL Contact Refresh path: the CSV has already been downloaded by
            // the modal. Our job here is to flip `inCrm` to true on every lead
            // that matched a GHL contact, and record when the sync happened.
            // Future syncs can show "last refreshed X days ago" in the lead
            // detail and surface stale syncs in the NOT IN CRM stat card logic.
            if (ghlRefresh) {
              const matchSet = new Set(matchedLeadIds || []);
              if (matchSet.size === 0) return;
              const now = new Date().toISOString();
              setAllLeads((prev) => prev.map((l) =>
                matchSet.has(l.id) ? { ...l, inCrm: true, crmSyncedAt: now } : l
              ));
              return;
            }
            // Standard enrich + insert path (County / RealForeclose / MLS imports).
            setAllLeads((prev) => {
              // Build maps keyed by both folio and address so updates apply
              // regardless of which match key the schema used
              const folioMap = new Map();
              const addrMap = new Map();
              updates.forEach((u) => {
                if (u.byField === "address") addrMap.set(u.matchKey, u.enrichments);
                else folioMap.set(u.matchKey, u.enrichments);
              });
              const enriched = prev.map((l) => {
                const fNorm = normalizeFolio(l.folio);
                const aNorm = normalizeAddress(l.propertyAddress);
                const folioEnrich = fNorm && folioMap.get(fNorm);
                const addrEnrich  = aNorm && addrMap.get(aNorm);
                if (folioEnrich || addrEnrich) {
                  // Folio-keyed update wins if both present (county sources are authoritative on identity)
                  return { ...l, ...(addrEnrich || {}), ...(folioEnrich || {}) };
                }
                return l;
              });
              // Append inserts (new Comp Source leads from MLS imports)
              return inserts && inserts.length ? [...enriched, ...inserts.map(legacyToNewShape)] : enriched;
            });
          }}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================
function SidebarItem({ icon: Icon, label, count, active, onClick, iconColor }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition" style={{
      background: active ? "#2563eb" : "transparent",
      color: active ? "white" : "#334155",
    }}>
      <Icon className="w-4 h-4" style={{ color: active ? "white" : (iconColor || "#64748b") }} />
      <span className="flex-1 text-left">{label}</span>
      <span className="text-xs font-bold opacity-80">{fmtCount(count)}</span>
    </button>
  );
}

function StatCard({ icon: Icon, iconColor, value, label, sublabel, small, onClick, active }) {
  const isClickable = !!onClick;
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-5 shadow-sm transition ${isClickable ? "cursor-pointer hover:shadow-md" : ""}`}
      style={{
        background: active ? `${iconColor}10` : "white",
        borderColor: active ? iconColor : "#e2e8f0",
        borderWidth: active ? "2px" : "1px",
      }}
      title={isClickable ? (active ? "Click to clear this filter" : "Click to filter leads to this group") : undefined}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-6 h-6 mt-1" style={{ color: iconColor }} />
        <div className="flex-1">
          <div className={small ? "text-base font-bold" : "text-3xl font-bold"} style={{ color: iconColor, lineHeight: 1.1 }}>{value}</div>
          <div className="text-[11px] font-bold tracking-wider mt-2" style={{ color: "#64748b" }}>{label}</div>
          {sublabel && <div className="text-[10px] mt-1" style={{ color: "#94a3b8" }}>{sublabel}</div>}
          {active && (
            <div className="text-[9px] mt-2 font-bold tracking-wider" style={{ color: iconColor }}>
              ✓ FILTER ACTIVE · CLICK TO CLEAR
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterTab({ label, active, onClick, color, count }) {
  return (
    <button onClick={onClick} className="px-3 py-2 rounded-lg text-xs font-bold transition" style={{
      background: active ? (color || "#2563eb") : "white",
      color: active ? "white" : (color || "#475569"),
      border: `1px solid ${active ? (color || "#2563eb") : "#e2e8f0"}`,
    }}>
      {label}
      {count != null && (
        <span className="ml-1.5 opacity-70 font-normal">· {count}</span>
      )}
    </button>
  );
}

function scoreColor(s) {
  if (s >= 70) return "#dc2626";
  if (s >= 50) return "#f59e0b";
  if (s >= 30) return "#16a34a";
  return "#94a3b8";
}

// ----------------------------------------------------------------------------
// LEAD DETAIL MODAL
// ----------------------------------------------------------------------------
function LeadNotesSection({ lead, setAllLeads }) {
  const initialNotes = lead.notes || "";
  const [draft, setDraft] = useState(initialNotes);
  const [expanded, setExpanded] = useState(!!initialNotes);
  const [savedAt, setSavedAt] = useState(lead.notesUpdatedAt || null);
  const dirty = draft !== (lead.notes || "");

  const handleSave = () => {
    const now = new Date().toISOString();
    setAllLeads((prev) => prev.map((l) => l.id === lead.id ? {
      ...l,
      notes: draft,
      notesUpdatedAt: now,
    } : l));
    setSavedAt(now);
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full text-left rounded-xl p-3 border-2 border-dashed transition flex items-center gap-2"
        style={{ borderColor: "#e2e8f0", background: "#fafbfc", color: "#64748b" }}
      >
        <FileText className="w-4 h-4" style={{ color: "#94a3b8" }} />
        <span className="text-xs font-medium">+ Add notes for this lead</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl p-4 border" style={{ borderColor: "#fde68a", background: "#fffbeb" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" style={{ color: "#d97706" }} />
          <div className="text-[11px] font-bold tracking-wider" style={{ color: "#92400e" }}>NOTES</div>
        </div>
        {savedAt && !dirty && (
          <span className="text-[10px]" style={{ color: "#92400e" }}>
            Saved {savedAt.slice(0, 10)} {savedAt.slice(11, 16)}
          </span>
        )}
        {dirty && (
          <span className="text-[10px] font-bold" style={{ color: "#dc2626" }}>● Unsaved changes</span>
        )}
      </div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Owner reached out, callback Tuesday at 3pm. Heir lives in Atlanta. Roof needs replacement. Wants $250K cash, will negotiate."
        rows={4}
        className="w-full text-sm p-2.5 rounded border font-mono leading-relaxed"
        style={{ borderColor: "#fcd34d", background: "white", color: "#0f172a", resize: "vertical" }}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={() => { setDraft(""); setExpanded(false); }}
          className="px-3 py-1.5 rounded text-xs font-medium"
          style={{ background: "white", color: "#64748b", border: "1px solid #e2e8f0" }}
        >
          Hide
        </button>
        <button
          onClick={handleSave}
          disabled={!dirty}
          className="px-3 py-1.5 rounded text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#d97706" }}
        >
          {dirty ? "Save Notes" : "✓ Saved"}
        </button>
      </div>
    </div>
  );
}

function LeadDetailModal({ lead, onClose, onComp, onCalc, setAllLeads, codeViolationsApi, codeViolationsCache, updateCodeViolationsCache }) {
  const mlsCfg = MLS_STATUS_BY_KEY[lead.mlsStatus] || { color: "#64748b", label: lead.mlsStatus || "Unknown", scoreAdj: 0, outreachBlocked: false };
  const blocked = lead.outreachBlocked;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex items-start justify-between" style={{ borderColor: "#e2e8f0" }}>
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center justify-center w-12 h-7 rounded text-white font-bold text-sm" style={{ background: scoreColor(lead.score) }}>{lead.score}</span>
              {/* Fallback: getPrimaryLeadType returns null for D4D-only leads, estate-signal-only leads, or unmapped scraped data. */}
              <span className="font-bold text-sm" style={{ color: TYPE_COLOR[getPrimaryLeadType(lead)] || "#475569" }}>{(getPrimaryLeadType(lead) || "—").toUpperCase()}</span>
              {lead.mlsStatus && lead.mlsStatus !== "Off-Market" && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold border" style={{
                  borderColor: mlsCfg.color,
                  background: `${mlsCfg.color}15`,
                  color: mlsCfg.color,
                }}>
                  {(lead.mlsStatus === "Expired" || lead.mlsStatus === "Canceled") && "★ "}MLS {lead.mlsStatus.toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>{lead.propertyAddress}</h2>
            <div className="text-sm" style={{ color: "#64748b" }}>{lead.propertyCity}</div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#64748b" }} /></button>
        </div>

        {/* OUTREACH GUARDRAIL — Active/Pending listings */}
        {blocked && (
          <div className="px-6 py-4 border-b flex items-start gap-3" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
            <div className="text-sm" style={{ color: "#991b1b" }}>
              <strong>Outreach blocked — property is currently {lead.mlsStatus} on MLS.</strong>
              <div className="text-xs mt-1 leading-relaxed">
                Direct seller contact while another agent has an active listing agreement is tortious interference and a violation of NAR Article 16 / MIAMI MLS rules. Wait until the status changes to Expired or Canceled, then this lead unlocks automatically.
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* NOTES — per-lead freeform notes */}
          <LeadNotesSection lead={lead} setAllLeads={setAllLeads} />

          <div>
            <div className="text-xs font-bold tracking-wider mb-2" style={{ color: "#64748b" }}>FLAGS</div>
            <div className="flex flex-wrap gap-2">
              {lead.flags.map((f, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-medium border" style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#475569" }}>{f}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider mb-2" style={{ color: "#64748b" }}>RESEARCH LINKS</div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <a href={buildSearchUrl(lead)} target="_blank" rel="noopener noreferrer" className="col-span-2 px-3 py-2 rounded-lg border bg-white flex items-center justify-between hover:bg-cyan-50 transition" style={{ borderColor: "#a5f3fc", color: "#0891b2" }} title="Web search for this address — opens a Google search page with the map widget (Street View thumbnail), Zillow result when indexed, plus Redfin, Trulia, Realtor.com, and county records. Single landing page for all external property research. Will split into dedicated 1-click Zillow / Street View buttons after Phase 1 + Phase 8.5 of the migration plan.">
                <span className="font-medium flex items-center gap-1.5"><Search className="w-3.5 h-3.5" /> Web Search (Zillow + Street View + Others)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* ESTATE STATUS — confirmed EST OF */}
          {hasListType(lead, "Deceased") && (
            <div className="rounded-xl p-4 border" style={{ borderColor: "#bbf7d0", background: "#f0fdf4" }}>
              <div className="flex items-center gap-2 mb-3">
                <UserCircle className="w-4 h-4" style={{ color: "#15803d" }} />
                <div className="text-[11px] font-bold tracking-wider" style={{ color: "#15803d" }}>
                  CONFIRMED ESTATE — OWNER NAME INDICATES DECEASED
                </div>
              </div>
              <div className="text-sm" style={{ color: "#0f172a" }}>
                <div className="text-xs" style={{ color: "#15803d" }}>PA roll owner field:</div>
                <div className="font-mono font-bold text-[13px] mt-1 px-2 py-1 rounded" style={{ background: "#dcfce7" }}>{lead.owner}</div>
              </div>
              {lead.estatePersonalRepresentative && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "#bbf7d0" }}>
                  <div className="text-xs" style={{ color: "#15803d" }}>Personal Representative (from c/o):</div>
                  <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{lead.estatePersonalRepresentative}</div>
                  <div className="text-[11px] mt-1" style={{ color: "#15803d" }}>This is the person handling the estate. Direct your outreach here, not to the deceased's name.</div>
                </div>
              )}
              <div className="mt-3 pt-3 border-t text-xs leading-relaxed" style={{ borderColor: "#bbf7d0", color: "#15803d" }}>
                <strong>Outreach guidance:</strong> Address mail to "The Estate of {lead.owner.replace(/EST(ATE)?\s*OF|DECD|DECEASED/gi, "").replace(/C\/O.*$/, "").trim()}" or to the personal representative. Probate may or may not be filed yet — check the Civil/Family/Probate Online System with the deceased's name to see status.
              </div>
            </div>
          )}

          {/* ESTATE STATUS — co-owner with one estate, one living */}
          {hasListType(lead, "Deceased/2nd Owner") && (
            <div className="rounded-xl p-4 border" style={{ borderColor: "#ddd6fe", background: "#f5f3ff" }}>
              <div className="flex items-center gap-2 mb-3">
                <UserCircle className="w-4 h-4" style={{ color: "#7c3aed" }} />
                <div className="text-[11px] font-bold tracking-wider" style={{ color: "#5b21b6" }}>
                  CO-OWNER ESTATE — ONE OWNER DECEASED, ONE LIVING
                </div>
              </div>
              <div className="text-sm" style={{ color: "#0f172a" }}>
                <div className="text-xs" style={{ color: "#5b21b6" }}>PA roll owner field:</div>
                <div className="font-mono font-bold text-[12px] mt-1 px-2 py-1 rounded" style={{ background: "#ede9fe" }}>{lead.owner}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <span className="text-xs" style={{ color: "#5b21b6" }}>Deceased co-owner</span>
                  <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{lead.estateDeceasedOwner}</div>
                </div>
                <div>
                  <span className="text-xs" style={{ color: "#5b21b6" }}>Living co-owner ← contact target</span>
                  <div className="font-bold text-[13px]" style={{ color: "#15803d" }}>{lead.estateLivingCoOwner}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t text-xs leading-relaxed" style={{ borderColor: "#ddd6fe", color: "#5b21b6" }}>
                <strong>Outreach guidance:</strong> The living co-owner is on title and almost always a surviving spouse or close relative. They're alive, often in their 70s or 80s, and now making the property decision alone. Address mail and calls to <strong>{lead.estateLivingCoOwner}</strong> directly. Skip the "Estate of" framing — that applies to {lead.estateDeceasedOwner}'s half but not theirs. Probate may not be filed; the surviving spouse often holds the property under right of survivorship and doesn't need it.
              </div>
            </div>
          )}

          {/* ESTATE STATUS — Lady Bird Deed / Life Estate */}
          {hasListType(lead, "LE / REM") && (
            <div className="rounded-xl p-4 border" style={{ borderColor: "#fde68a", background: "#fffbeb" }}>
              <div className="flex items-center gap-2 mb-3">
                <UserCircle className="w-4 h-4" style={{ color: "#d97706" }} />
                <div className="text-[11px] font-bold tracking-wider" style={{ color: "#92400e" }}>
                  LIFE ESTATE / REMAINDERMAN — LADY BIRD DEED STRUCTURE
                </div>
              </div>
              <div className="text-sm" style={{ color: "#0f172a" }}>
                <div className="text-xs" style={{ color: "#92400e" }}>PA roll owner field:</div>
                <div className="font-mono font-bold text-[12px] mt-1 px-2 py-1 rounded" style={{ background: "#fef3c7" }}>{lead.owner}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                {lead.estateLifeEstateHolder && (
                  <div>
                    <span className="text-xs" style={{ color: "#92400e" }}>Life Estate Holder (LE)</span>
                    <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{lead.estateLifeEstateHolder}</div>
                    <div className="text-[10px]" style={{ color: "#92400e" }}>Lives in / controls property until death</div>
                  </div>
                )}
                {lead.estateRemaindermen && lead.estateRemaindermen.length > 0 && (
                  <div>
                    <span className="text-xs" style={{ color: "#92400e" }}>Remainderman / Remaindermen (REM)</span>
                    {lead.estateRemaindermen.map((r, i) => (
                      <div key={i} className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{r}</div>
                    ))}
                    <div className="text-[10px]" style={{ color: "#92400e" }}>Receives property automatically when LE dies</div>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t text-xs leading-relaxed" style={{ borderColor: "#fde68a", color: "#92400e" }}>
                <strong>Outreach strategy:</strong> A sale typically requires <strong>both the LE and the remainderman</strong> to sign the deed. Skip-trace all parties. The LE's mailing address is usually the property; remaindermen often live elsewhere — check the PA mailing field for clues.
              </div>
              <div className="mt-2 text-xs leading-relaxed" style={{ color: "#92400e" }}>
                <strong>Watch for:</strong> if the LE dies and you stop seeing their name on the PA roll while the REM remains, the property has fully transferred to the remainderman with <em>no probate required</em>. That's one of the cleanest motivated-seller setups in real estate — single decision-maker, often an out-of-state heir who never wanted the property.
              </div>
            </div>
          )}

          {/* ESTATE STATUS — possible (inferred) */}
          {hasListType(lead, "Possible Deceased") && (
            <div className="rounded-xl p-4 border" style={{ borderColor: "#a5f3fc", background: "#ecfeff" }}>
              <div className="flex items-center gap-2 mb-3">
                <UserCircle className="w-4 h-4" style={{ color: "#0891b2" }} />
                <div className="text-[11px] font-bold tracking-wider" style={{ color: "#155e75" }}>
                  POSSIBLE ESTATE — INFERRED FROM HOLDING PATTERN
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs" style={{ color: "#155e75" }}>Last Sale Date</span>
                  <div className="font-bold" style={{ color: "#0f172a" }}>{lead.lastSaleDate || "Unknown"}</div>
                </div>
                {lead.estateYearsHeld && (
                  <div>
                    <span className="text-xs" style={{ color: "#155e75" }}>Years Held</span>
                    <div className="font-bold" style={{ color: "#0f172a" }}>{lead.estateYearsHeld} years</div>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t text-xs leading-relaxed" style={{ borderColor: "#a5f3fc", color: "#155e75" }}>
                <strong>Why flagged:</strong> {lead.estateReason}.
              </div>
              <div className="mt-2 text-xs leading-relaxed" style={{ color: "#155e75" }}>
                <strong>Outreach guidance:</strong> This is <em>inferred</em>, not confirmed. Address mail to the owner by name (not "Estate of") — you don't want to imply someone is deceased who isn't. Use a softer opener: "We help long-time {lead.propertyCity.split(",")[0]} homeowners explore their options…" Skip-trace and check obituary databases (Legacy.com, local funeral homes) before changing tone.
              </div>
            </div>
          )}



          {/* AUCTION DATA — PropertyOnion (FJ + auction date + verdict) */}
          {(hasListType(lead, "PFC Auction") || (hasListType(lead, "Tax Default") || hasListType(lead, "Tax Deed"))) && (
            <AuctionDataPanel
              lead={lead}
              onUpdate={(updates) => {
                setAllLeads((prev) => prev.map((l) => l.id === lead.id ? {
                  ...l,
                  auctionData: {
                    ...(l.auctionData || {}),
                    ...updates,
                    ...computeEquityVerdict({
                      arvEstimate: updates.arvEstimate ?? l.auctionData?.arvEstimate,
                      repairsEstimate: updates.repairsEstimate ?? l.auctionData?.repairsEstimate,
                      finalJudgment: updates.finalJudgment ?? l.auctionData?.finalJudgment,
                      paTotalValue: updates.paTotalValue ?? l.auctionData?.paTotalValue,
                    }),
                  },
                } : l));
              }}
            />
          )}

          {/* ADVERSE POSSESSION — title risk warning */}
          {(lead.paTags || []).includes("Adverse Possession") && (
            <div className="rounded-xl p-4 border" style={{ borderColor: "#bbf7d0", background: "#f0fdf4" }}>
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4" style={{ color: "#15803d" }} />
                <div className="text-[11px] font-bold tracking-wider" style={{ color: "#15803d" }}>
                  ★ ADVERSE POSSESSION — SPECIALTY TITLE OPPORTUNITY
                </div>
              </div>
              <div className="text-sm" style={{ color: "#0f172a" }}>
                <div className="text-xs" style={{ color: "#15803d" }}>Legal1 description (PA roll):</div>
                <div className="font-mono font-bold text-[11px] mt-1 px-2 py-1 rounded" style={{ background: "#dcfce7" }}>{lead.legalDesc}</div>
              </div>
              <div className="mt-3 pt-3 border-t text-xs leading-relaxed" style={{ borderColor: "#bbf7d0", color: "#15803d" }}>
                <strong>What's likely going on:</strong> Someone is asserting ownership through occupation + tax payment under Florida §95.18. The three common shapes:
                <div className="mt-2 ml-3 space-y-1">
                  <div>• <strong>Perfected claim, occupant wants out</strong> — they've held it 7+ years, paid taxes, and now want to monetize. Cleanest path; quiet-title action and you're done.</div>
                  <div>• <strong>Actual owner emerging</strong> — heirs surfaced, want to sell, need the cloud cleared first. Often paired with Probate or EST OF on the same parcel.</div>
                  <div>• <strong>In-progress claim</strong> — someone occupying but not yet at the 7-year mark. More work; viable if the timeline math is right for your hold.</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t text-xs leading-relaxed" style={{ borderColor: "#bbf7d0", color: "#15803d" }}>
                <strong>Qualifying questions on the call:</strong>
                <div className="mt-2 ml-3 space-y-1">
                  <div>• How long have you been on the property? (Confirms 7-year statutory period.)</div>
                  <div>• Have you been paying the property taxes the whole time? (§95.18 requires it.)</div>
                  <div>• Have you filed a Return of Real Property under §95.18(2)?</div>
                  <div>• Has anyone disputed your possession or sent you anything?</div>
                  <div>• Do you know where the original owner / heirs are?</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t text-xs leading-relaxed" style={{ borderColor: "#bbf7d0", color: "#15803d" }}>
                <strong>Deal structure reminder:</strong> Standard playbook — quiet-title action coordinated with your title attorney, longer close timeline (60–120 days vs. 30), priced to reflect the work. Your fee should reflect the complexity, not just the spread.
              </div>
              <div className="mt-2 text-xs leading-relaxed" style={{ color: "#92400e" }}>
                <strong>Diligence cue:</strong> Vet the claim before locking up. Failed/contested claims need a different path than perfected ones — confirm the §95.18 elements are actually met before you commit capital. You know this; just a reminder it's not "any AP lead is a deal."
              </div>
            </div>
          )}

          {/* POSSIBLE PI — partial-interest sale to a partition fund / investor */}
          {lead.possiblePi && (
            <div className="rounded-xl p-4 border" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: "#dc2626" }} />
                  <div className="text-[11px] font-bold tracking-wider" style={{ color: "#991b1b" }}>
                    ★ POSSIBLE PI — PARTIAL-INTEREST SALE DETECTED
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "#fee2e2", color: "#991b1b" }}>
                  LEAD STILL ACTIVE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <span className="text-xs" style={{ color: "#991b1b" }}>Buyer Entity (now a co-owner)</span>
                  <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{lead.possiblePi.buyerEntity}</div>
                  <div className="text-[10px]" style={{ color: "#991b1b" }}>recorded {lead.possiblePi.soldDate} · CFN {lead.possiblePi.cfn}</div>
                </div>
                <div>
                  <span className="text-xs" style={{ color: "#991b1b" }}>Inferred Sale Price (partial interest)</span>
                  <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{fmtMoney(lead.possiblePi.soldPrice)}</div>
                  <div className="text-[10px]" style={{ color: "#991b1b" }}>far below market — fractional interest, not full property</div>
                </div>
              </div>
              <div className="rounded p-2.5 text-xs mb-3" style={{ background: "#fee2e2" }}>
                <div className="font-bold mb-1" style={{ color: "#991b1b" }}>Who sold their interest:</div>
                <div className="space-y-0.5" style={{ color: "#7f1d1d" }}>
                  {lead.possiblePi.soldGrantors.map((g, i) => (
                    <div key={i} className="font-mono text-[11px]">• {g}</div>
                  ))}
                </div>
                <div className="font-bold mt-2 mb-1" style={{ color: "#15803d" }}>Remaining co-owners — your contact targets:</div>
                <div className="space-y-0.5" style={{ color: "#15803d" }}>
                  {lead.possiblePi.remainingCoOwners.length > 0 ? lead.possiblePi.remainingCoOwners.map((o, i) => (
                    <div key={i} className="font-mono text-[11px] font-bold">→ {o}</div>
                  )) : <div className="italic text-[11px]">Could not parse — review the original deed in Official Records</div>}
                </div>
              </div>
              <div className="text-xs leading-relaxed" style={{ color: "#991b1b" }}>
                <strong>What likely happened:</strong> One or more co-owners (often siblings who inherited together, or divorced spouses) sold their fractional interest to a partition fund / investor entity. The buyer paid well below market because they only bought a partial interest, not the property. The remaining co-owners are still on title — and now they're sharing ownership with a hostile investor who can file a partition action to force the property to be sold.
              </div>
              <div className="mt-2 text-xs leading-relaxed" style={{ color: "#991b1b" }}>
                <strong>Why this is high-conversion:</strong> The remaining co-owners are <em>more</em> motivated now, not less. They're afraid of partition litigation, they don't want a stranger as a partner, and they'd often rather sell to <em>you</em> at a fair price than fight in court. Standard wholesalers see "WD recorded → mark sold" and walk away. You're not them.
              </div>
              <div className="mt-2 text-xs leading-relaxed" style={{ color: "#991b1b" }}>
                <strong>Outreach play:</strong> Reach the remaining co-owners directly. Lead with empathy ("I noticed there's been some changes on title — that can be stressful"). Offer to buy out their interest, then negotiate with the partition fund afterward. Title attorney coordination is required; this is one of those deals where you earn your fee through complexity, not just spread.
              </div>
            </div>
          )}

          {/* BAD CONDITION SCORE — driving-list / scouting condition signals */}
          {(() => {
            const tags = lead.conditionTags || [];
            const score = lead.badConditionScore || 0;
            const hasAny = tags.length > 0;
            // Always render the panel (even with score=0) so user can manually toggle marks
            const scoreBg = score >= 70 ? "#fee2e2" : score >= 40 ? "#fef3c7" : score > 0 ? "#fefce8" : "#f8fafc";
            const scoreColor = score >= 70 ? "#991b1b" : score >= 40 ? "#92400e" : score > 0 ? "#854d0e" : "#475569";
            const scoreBorder = score >= 70 ? "#fca5a5" : score >= 40 ? "#fde68a" : score > 0 ? "#fef08a" : "#e2e8f0";
            return (
              <div className="rounded-xl p-4 border" style={{ borderColor: scoreBorder, background: scoreBg }}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" style={{ color: scoreColor }} />
                    <div className="text-[11px] font-bold tracking-wider" style={{ color: scoreColor }}>
                      {hasAny ? "★ " : ""}BAD CONDITION SCORE
                    </div>
                  </div>
                  <div className="font-mono font-bold text-2xl" style={{ color: scoreColor }}>
                    {score}<span className="text-xs opacity-60">/100</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: "white", border: `1px solid ${scoreBorder}` }}>
                  <div className="h-full transition-all" style={{ width: `${score}%`, background: scoreColor }}></div>
                </div>
                {hasAny && (
                  <div className="text-xs leading-relaxed mb-3" style={{ color: scoreColor }}>
                    {tags.map((tk) => {
                      const def = BAD_CONDITION_TAGS.find((t) => t.key === tk);
                      return def ? (
                        <div key={tk} className="mb-1.5">
                          <strong>{def.label}:</strong> {def.description}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
                <div className="text-[10px] font-bold tracking-wider mb-2" style={{ color: "#64748b" }}>MANUAL MARKS</div>
                {(() => {
                  // Centralized toggle logic. Updates conditionTags array,
                  // recomputes the badConditionScore, applies the mainScoreBoost
                  // delta to the main motivation score, and syncs the flags array.
                  const applyTagChange = (nextTagsBuilder) => {
                    setAllLeads((prev) => prev.map((l) => {
                      if (l.id !== lead.id) return l;
                      const prevTags = Array.isArray(l.conditionTags) ? l.conditionTags : [];
                      const nextTags = nextTagsBuilder(prevTags);
                      const prevBoost = computeBadConditionMainBoost(prevTags);
                      const nextBoost = computeBadConditionMainBoost(nextTags);
                      const baseScore = (l.score || 50) - prevBoost;
                      const nextScore = Math.min(100, Math.max(0, baseScore + nextBoost));
                      let nextFlags = (l.flags || []).filter((f) => !BAD_CONDITION_KEYS.includes(f));
                      nextFlags = [...nextFlags, ...nextTags];
                      return {
                        ...l,
                        conditionTags: nextTags,
                        badConditionScore: computeBadConditionScore(nextTags),
                        score: nextScore,
                        flags: nextFlags,
                      };
                    }));
                  };
                  // Group dimensions by renderGroup so multiple dimensions can share
                  // one visual row (e.g., Occupancy + Observation Source render together).
                  // Internal data model still tracks each dimension separately so
                  // single-select replacement only affects siblings in the SAME dimension.
                  const groups = new Map();
                  BAD_CONDITION_DIMENSIONS.forEach((dim) => {
                    const gk = dim.renderGroup || dim.key;
                    if (!groups.has(gk)) groups.set(gk, []);
                    groups.get(gk).push(dim);
                  });
                  const renderTagBtn = (tagDef, dim) => {
                    const isActive = tags.includes(tagDef.key);
                    const dimKeys = dim.tags.map((t) => t.key);
                    return (
                      <button
                        key={tagDef.key}
                        onClick={() => {
                          applyTagChange((prevTags) => {
                            if (isActive) {
                              return prevTags.filter((k) => k !== tagDef.key);
                            } else if (dim.selectMode === "single") {
                              return [...prevTags.filter((k) => !dimKeys.includes(k)), tagDef.key];
                            } else {
                              return [...prevTags, tagDef.key];
                            }
                          });
                        }}
                        className="px-2.5 py-1 rounded text-[11px] font-bold border transition"
                        style={{
                          background: isActive ? tagDef.color : "white",
                          color: isActive ? "white" : tagDef.color,
                          borderColor: tagDef.borderColor,
                        }}
                        title={tagDef.description}
                      >
                        {isActive ? "✓ " : ""}{tagDef.label}{tagDef.badConditionPoints > 0 && (
                          <span className="ml-1 opacity-60 font-normal">+{tagDef.badConditionPoints}</span>
                        )}
                      </button>
                    );
                  };
                  return (
                    <div className="space-y-2">
                      {[...groups.values()].map((dimList, gi) => (
                        <div key={gi} className="flex flex-wrap gap-1.5">
                          {dimList.flatMap((dim) => dim.tags.map((tagDef) => renderTagBtn(tagDef, dim)))}
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {!hasAny && (
                  <div className="text-[11px] mt-2" style={{ color: "#64748b" }}>
                    Click a tag above to mark this property based on what you saw scouting it.
                  </div>
                )}
              </div>
            );
          })()}

          {/* CODE VIOLATIONS — live from Miami-Dade GIS Open Data REST API */}
          {!lead.soldAt && (
            <CodeViolationsPanel
              lead={lead}
              apiConfig={codeViolationsApi}
              cache={codeViolationsCache}
              onCacheUpdate={updateCodeViolationsCache}
            />
          )}

          {/* SALE / DEED VERIFICATION PANEL */}
          {lead.soldAt && (
            <div className="rounded-xl p-4 border" style={{ borderColor: "#bbf7d0", background: "#f0fdf4" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCheck className="w-4 h-4" style={{ color: "#16a34a" }} />
                  <div className="text-[11px] font-bold tracking-wider" style={{ color: "#15803d" }}>
                    PROPERTY SOLD — RECORDED {lead.soldAt}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: `${DEED_TYPES[lead.soldDeedType]?.color}20`, color: DEED_TYPES[lead.soldDeedType]?.color }}>
                  {DEED_TYPES[lead.soldDeedType]?.label || lead.soldDeedType}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-xs" style={{ color: "#64748b" }}>Sale Price</span>
                  <div className="font-bold" style={{ color: "#0f172a" }}>{fmtMoney(lead.soldPrice)}</div>
                  <div className="text-[10px]" style={{ color: "#64748b" }}>inferred from doc stamps</div>
                </div>
                <div>
                  <span className="text-xs" style={{ color: "#64748b" }}>New Owner</span>
                  <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{lead.newOwner}</div>
                </div>
                <div>
                  <span className="text-xs" style={{ color: "#64748b" }}>Previous Owner</span>
                  <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{lead.owner}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-start gap-2 text-xs" style={{ borderColor: "#bbf7d0", color: "#15803d" }}>
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>Lead automatically removed from active queue. Stop all outreach. The new owner may be a buyer's-list candidate (cash buyer for a fixer? add them to your buyer database).</span>
              </div>
            </div>
          )}

          {(hasListType(lead, "Inherited Probate") || hasListType(lead, "Inherited QCD")) && lead.ownerHeirs && (
            <div className="rounded-xl p-4 border" style={{ borderColor: "#a5f3fc", background: "#ecfeff" }}>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4" style={{ color: "#0891b2" }} />
                <div className="text-[11px] font-bold tracking-wider" style={{ color: "#155e75" }}>
                  INHERITED PROPERTY — HEIRS RECEIVED TITLE {lead.inheritedAt}
                </div>
              </div>
              <div className="text-sm" style={{ color: "#0f172a" }}>
                <div className="text-xs" style={{ color: "#155e75" }}>Heirs ({lead.ownerHeirs.length}):</div>
                {lead.ownerHeirs.map((h, i) => (
                  <div key={i} className="font-bold text-[13px]">{h}</div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t text-xs leading-relaxed" style={{ borderColor: "#a5f3fc", color: "#155e75" }}>
                <strong>Inherited via PR's Deed of Distribution.</strong> Estate transferred title to heirs at $0 consideration — no sale occurred. Heirs typically don't live in the property and often want to liquidate. Skip-trace all {lead.ownerHeirs.length} heir{lead.ownerHeirs.length === 1 ? "" : "s"}; sibling disagreement on what to do is itself a motivation signal.
              </div>
            </div>
          )}

          {lead.previousOwner && lead.ownerChangedAt && !lead.soldAt && (
            <div className="rounded-xl p-3 border flex items-start gap-2 text-xs" style={{ borderColor: "#cffafe", background: "#f0f9ff", color: "#155e75" }}>
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Owner changed via Quit Claim Deed on {lead.ownerChangedAt}</strong> at low/no consideration (likely family transfer or trust funding). Previous owner: {lead.previousOwner}.
              </span>
            </div>
          )}

          {/* MORTGAGE INFO — Realist forward-mortgage data */}
          {!lead.reverseMortgage && !hasListType(lead, "PFC Auction") && !hasListType(lead, "Tax Default") && !hasListType(lead, "Tax Deed") && (
            <MortgageInfoPanel
              lead={lead}
              onUpdate={(updates) => {
                setAllLeads((prev) => prev.map((l) => l.id === lead.id ? {
                  ...l,
                  mortgageInfo: { ...(l.mortgageInfo || {}), ...updates },
                } : l));
              }}
            />
          )}

          {/* POSSIBLE PACE — tax-roll signal */}
          {lead.possiblePace && (
            <div className="rounded-xl p-4 border" style={{ borderColor: "#fde68a", background: "#fffbeb" }}>
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="w-4 h-4" style={{ color: "#d97706" }} />
                <div className="text-[11px] font-bold tracking-wider" style={{ color: "#92400e" }}>
                  ★ POSSIBLE PACE LOAN — TAX ROLL DOUBLED
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                <div>
                  <span className="text-xs" style={{ color: "#92400e" }}>Prior Year ({lead.possiblePace.jumpYear - 1})</span>
                  <div className="font-bold text-[14px]" style={{ color: "#0f172a" }}>{fmtMoney(lead.possiblePace.priorYearTax)}</div>
                </div>
                <div>
                  <span className="text-xs" style={{ color: "#92400e" }}>Jump Year ({lead.possiblePace.jumpYear})</span>
                  <div className="font-bold text-[14px]" style={{ color: "#dc2626" }}>{fmtMoney(lead.possiblePace.jumpYearTax)}</div>
                </div>
                <div>
                  <span className="text-xs" style={{ color: "#92400e" }}>Multiplier</span>
                  <div className="font-bold text-[14px]" style={{ color: "#dc2626" }}>{lead.possiblePace.multiplier.toFixed(2)}x</div>
                </div>
              </div>
              {lead.taxHistory && lead.taxHistory.length > 0 && (
                <div className="rounded p-2.5 mb-3" style={{ background: "#fef3c7" }}>
                  <div className="text-[10px] font-bold tracking-wider mb-1.5" style={{ color: "#92400e" }}>5-YEAR TAX HISTORY</div>
                  <div className="grid grid-cols-5 gap-2 text-[11px]">
                    {lead.taxHistory.map((th, i) => (
                      <div key={th.year} className="flex flex-col">
                        <span className="text-[9px]" style={{ color: "#92400e" }}>{th.year}</span>
                        <span className="font-mono font-bold" style={{ color: i > 0 && th.amount / lead.taxHistory[i-1].amount >= 1.80 ? "#dc2626" : "#0f172a" }}>
                          ${th.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-xs leading-relaxed" style={{ color: "#92400e" }}>
                <strong>What this likely means:</strong> The owner took out a PACE loan (Property Assessed Clean Energy — typically for solar, roofing, hurricane-impact windows). PACE assessments are added to the tax bill and stay there for 15-25 years. Most owners don't fully understand the cost until tax bills arrive. The PACE assessment runs with the land, which makes the property nearly impossible to sell or refinance through a conventional lender.
              </div>
              <div className="mt-2 text-xs leading-relaxed" style={{ color: "#92400e" }}>
                <strong>Why this is a strong lead:</strong> PACE owners are often early-stage motivated sellers — not yet on Lis Pendens, not yet behind on property tax, but increasingly aware that the property has become a financial trap. Outreach play: "I work with homeowners who took PACE loans and now want to sell — most lenders won't finance buyers because of the assessment, so cash sales are usually the only path. We pay cash and handle the PACE payoff at closing."
              </div>

              {/* Verification block — Clerk is the authoritative source */}
              <div className="mt-3 rounded-lg p-3 border-2" style={{ background: "white", borderColor: "#d97706" }}>
                <div className="text-[10px] font-bold tracking-wider mb-2" style={{ color: "#92400e" }}>
                  ★ VERIFY THIS LEAD — CLERK OF COURTS
                </div>
                <div className="text-xs leading-relaxed mb-3" style={{ color: "#0f172a" }}>
                  PACE loans are recorded as financing statements / assessment liens in the Miami-Dade Clerk's Official Records. <strong>This is the authoritative source</strong> — the tax-roll signal above is just the tripwire. Confirm before outreach.
                </div>
                <div className="text-[11px] mb-2" style={{ color: "#475569" }}>
                  In the Clerk search, look up <strong>{lead.owner}</strong> as Grantor or Grantee, then scan for any of these party names recorded against this folio:
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {["FLORIDA PACE FUNDING", "RENEW", "YGRENE", "HERO", "FORTIFI", "ALLIANCE NRG", "FORWARD PACE"].map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold" style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>{p}</span>
                  ))}
                </div>
                <a
                  href="https://onlineservices.miamidadeclerk.gov/officialrecords/StandardSearch.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white"
                  style={{ background: "#d97706" }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Miami-Dade Clerk Official Records Search
                </a>
              </div>

              <div className="mt-2 text-[11px] leading-relaxed" style={{ color: "#92400e" }}>
                <strong>Secondary check:</strong> The Tax Collector portal will also show PACE as a non-ad-valorem line item (often labeled "PACE", "RENEW", "FL PACE", "YGRENE", or "HERO") with the annual installment and remaining balance. Useful for confirming the dollar amounts after you've found the lien in the Clerk records.
              </div>
            </div>
          )}

          {/* REVERSE MORTGAGE */}
          {lead.reverseMortgage && (
            <ReverseMortgagePanel
              lead={lead}
              onUpdate={(updates) => {
                setAllLeads((prev) => prev.map((l) => l.id === lead.id ? {
                  ...l,
                  reverseMortgage: { ...(l.reverseMortgage || {}), ...updates },
                } : l));
              }}
            />
          )}

                    {/* PA EXEMPTIONS — Senior + Widow/Widower */}
          {((lead.paTags || []).includes("Senior") || (lead.paTags || []).includes("Widow/Widower")) && (
            <div className="rounded-xl p-4 border" style={{ borderColor: "#ddd6fe", background: "#faf5ff" }}>
              <div className="flex items-center gap-2 mb-3">
                <UserCircle className="w-4 h-4" style={{ color: "#7c3aed" }} />
                <div className="text-[11px] font-bold tracking-wider" style={{ color: "#5b21b6" }}>
                  PA EXEMPTIONS ON FILE
                </div>
              </div>
              <div className="space-y-2">
                {(lead.paTags || []).includes("Widow/Widower") && (
                  <div className="rounded p-2.5 text-sm" style={{ background: "#ede9fe" }}>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: "#7c3aed", color: "white" }}>★ WIDOW/WIDOWER</span>
                      <span className="text-xs" style={{ color: "#5b21b6" }}>+20 score</span>
                    </div>
                    <div className="text-[11px] mt-1.5 leading-relaxed" style={{ color: "#5b21b6" }}>
                      {lead.paTagReasons?.["Widow/Widower"]}. Surviving spouse confirmed by the county. Often elderly, often holding a property that's now too big for one person.
                    </div>
                  </div>
                )}
                {(lead.paTags || []).includes("Senior") && (
                  <div className="rounded p-2.5 text-sm" style={{ background: "#cffafe" }}>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: "#0891b2", color: "white" }}>SENIOR</span>
                      <span className="text-xs" style={{ color: "#155e75" }}>+10 score</span>
                    </div>
                    <div className="text-[11px] mt-1.5 leading-relaxed" style={{ color: "#155e75" }}>
                      {lead.paTagReasons?.["Senior"]}. Confirmed by the county through the senior exemption filing. Common motivations: downsizing, fixed income, medical events, family pressure to sell.
                    </div>
                  </div>
                )}
              </div>
              {(lead.paTags || []).includes("Widow/Widower") && (lead.paTags || []).includes("Senior") && (
                <div className="mt-3 pt-3 border-t flex items-start gap-2 text-xs" style={{ borderColor: "#ddd6fe", color: "#5b21b6" }}>
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span><strong>High-conversion combination.</strong> Senior + Widow/Widower together = elderly surviving spouse. Highest-converting cohort in the entire database. Use respectful, slow-paced outreach — these owners often want to talk to someone they trust before selling.</span>
                </div>
              )}
            </div>
          )}

          {/* ABSENTEE OWNER */}
          {lead.absenteeTier && (
            <div className="rounded-xl p-4 border" style={{
              borderColor: lead.absenteeTier === "Out of Country" ? "#ddd6fe" :
                          lead.absenteeTier === "Out of State" ? "#fecaca" :
                          lead.absenteeTier === "In State" ? "#fde68a" :
                                                              "#cbd5e1",
              background: lead.absenteeTier === "Out of Country" ? "#faf5ff" :
                         lead.absenteeTier === "Out of State" ? "#fef2f2" :
                         lead.absenteeTier === "In State" ? "#fffbeb" :
                                                             "#f8fafc",
            }}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4" style={{
                  color: lead.absenteeTier === "Out of Country" ? "#7c3aed" :
                         lead.absenteeTier === "Out of State" ? "#dc2626" :
                         lead.absenteeTier === "In State" ? "#d97706" :
                                                             "#475569",
                }} />
                <div className="text-[11px] font-bold tracking-wider" style={{
                  color: lead.absenteeTier === "Out of Country" ? "#5b21b6" :
                         lead.absenteeTier === "Out of State" ? "#991b1b" :
                         lead.absenteeTier === "In State" ? "#92400e" :
                                                             "#334155",
                }}>
                  ABSENTEE OWNER — MAILING {lead.absenteeTier.toUpperCase()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs" style={{ color: "#64748b" }}>Property Address</span>
                  <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{lead.propertyAddress}</div>
                  <div className="text-[11px]" style={{ color: "#64748b" }}>{lead.propertyCity}</div>
                </div>
                <div>
                  <span className="text-xs" style={{ color: "#64748b" }}>Mailing Address (where the bills go)</span>
                  <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{lead.mailingAddress}</div>
                  <div className="text-[11px]" style={{ color: "#64748b" }}>{lead.mailingCity}</div>
                </div>
              </div>
              {lead.absenteeIsLlc && (
                <div className="mt-3 pt-3 border-t flex items-start gap-2 text-xs" style={{
                  borderColor: lead.absenteeTier === "Out of Country" ? "#ddd6fe" :
                              lead.absenteeTier === "Out of State" ? "#fecaca" :
                              lead.absenteeTier === "In State" ? "#fde68a" :
                                                                  "#cbd5e1",
                }}>
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#64748b" }} />
                  <span style={{ color: "#475569" }}>
                    <strong>LLC / corporate owner.</strong> The mailing address is often a registered agent, not the beneficial owner. Run an entity lookup on Sunbiz.org to find the principals — they're who actually decides whether to sell.
                  </span>
                </div>
              )}
              {lead.absenteeTier === "Out of State" && (
                <div className="mt-3 pt-3 border-t text-xs leading-relaxed" style={{ borderColor: "#fecaca", color: "#991b1b" }}>
                  <strong>Why this is high-conversion:</strong> Out-of-state owners don't visit, don't see code violations, don't have local sentiment. They're statistically the most willing to sell. Common backstories: inherited the property, bought as a "vacation" or "snowbird" plan that never materialized, an LLC tired of out-of-state filings. Skip-trace for current contact info — the mailing address might be 5+ years stale.
                </div>
              )}
              {lead.absenteeTier === "Out of Country" && (
                <div className="mt-3 pt-3 border-t text-xs leading-relaxed" style={{ borderColor: "#ddd6fe", color: "#5b21b6" }}>
                  <strong>Why this is highest-tier:</strong> International owners are the most disconnected from the property and the hardest for competitors to reach. Common backstories: Latin American snowbird family, foreign LLC, inherited from a relative who emigrated decades ago. Outreach challenges: mailing piece may take weeks to deliver, language preferences vary. But conversion is excellent when you reach them — they often haven't seen the property in years and don't want to deal with US property tax filings anymore.
                </div>
              )}
              {lead.absenteeTier === "In State" && (
                <div className="mt-3 pt-3 border-t text-xs leading-relaxed" style={{ borderColor: "#fde68a", color: "#92400e" }}>
                  <strong>Why this is mid-tier:</strong> Owner is elsewhere in Florida — often Tampa, Orlando, Jacksonville. They can drive down if they want to but typically don't. Could be a snowbird who relocated, an inheritance from Miami family, or an investment property. Conversion is solid; not as easy as out-of-state but easier than owner-occupants.
                </div>
              )}
              {lead.absenteeTier === "In County" && (
                <div className="mt-3 pt-3 border-t text-xs leading-relaxed" style={{ borderColor: "#cbd5e1", color: "#475569" }}>
                  <strong>Why this is lowest-tier absentee:</strong> Owner is somewhere else in Miami-Dade. They could drive over in 20 minutes, see the place, and decide not to sell. Often a landlord with a tenant, a relative living there rent-free, or a second property. Conversion lower than other absentee tiers but still meaningfully better than owner-occupied.
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl p-4 border" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
            <div className="text-xs font-bold tracking-wider mb-3" style={{ color: "#64748b" }}>OWNER INFO</div>
            <div className="space-y-2">
              <DetailRow label="Owner" value={lead.owner} />
              <DetailRow label="Folio" value={lead.folio} />
              <DetailRow label="Mailing Address" value={`${lead.mailingAddress}, ${lead.mailingCity}`} />
              <DetailRow label="Last Sale Date (PA)" value={lead.lastSaleDate || "Unknown — pre-digitization or never recorded"} />
              <DetailRow label="Amount Owed / Filed" value={lead.amount > 0 ? fmtMoney(lead.amount) : "—"} />
              <DetailRow label="Filed Date" value={lead.filed} />
              <DetailRow label="Equity Tier" value={lead.equity || "—"} />
            </div>
          </div>

          {/* MLS LISTING INFO PANEL */}
          {lead.mlsStatus && lead.mlsStatus !== "Off-Market" && (
            <div className="rounded-xl p-4 border" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] font-bold tracking-wider" style={{ color: "#64748b" }}>MLS LISTING — {mlsCfg.label.toUpperCase()}</div>
                <div className="flex items-center gap-2">
                  {lead.mlsStatus === "Sold" && lead.mlsBuyerFinancing === "Cash" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }} title="Buyer paid cash — prime cash-buyer-list candidate">
                      💵 CASH
                    </span>
                  )}
                  {lead.mlsId && (
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded" style={{ background: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe" }} title="MLS Number">
                      MLS# {lead.mlsId}
                    </span>
                  )}
                </div>
              </div>
              {lead.mlsStatus === "Sold" ? (
                /* SOLD layout — emphasize sold price + date, list price for comparison */
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-xs" style={{ color: "#64748b" }}>Sold Price</span>
                    <div className="font-bold" style={{ color: "#15803d" }}>{lead.soldPrice ? fmtMoney(lead.soldPrice) : "—"}</div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: "#64748b" }}>Sold Date</span>
                    <div className="font-bold text-xs" style={{ color: "#0f172a" }}>{lead.soldAt || "—"}</div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: "#64748b" }}>List Price</span>
                    <div className="font-bold text-xs" style={{ color: "#475569" }}>{lead.mlsListPrice ? fmtMoney(lead.mlsListPrice) : "—"}</div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: "#64748b" }}>Financing</span>
                    <div className="font-bold text-xs" style={{ color: lead.mlsBuyerFinancing === "Cash" ? "#15803d" : "#0f172a" }}>{lead.mlsBuyerFinancing || "—"}</div>
                  </div>
                </div>
              ) : (
                /* ACTIVE / PENDING / EXPIRED / CANCELED layout */
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-xs" style={{ color: "#64748b" }}>List Price</span>
                    <div className="font-bold" style={{ color: "#0f172a" }}>{lead.mlsListPrice ? fmtMoney(lead.mlsListPrice) : "—"}</div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: "#64748b" }}>Days on Market</span>
                    <div className="font-bold" style={{ color: "#0f172a" }}>
                      {lead.mlsDaysOnMarket || "—"}
                      {lead.mlsDaysOnMarket >= 120 && (lead.mlsStatus === "Active" || lead.mlsStatus === "Pending") && (
                        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }} title="Long-DOM Active — possible title distress signal. See code comment in applyImport for future strategy.">long-DOM</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: "#64748b" }}>List Date</span>
                    <div className="font-bold text-xs" style={{ color: "#0f172a" }}>{lead.mlsListDate || "—"}</div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: "#64748b" }}>Status Date</span>
                    <div className="font-bold text-xs" style={{ color: "#0f172a" }}>{lead.mlsStatusDate || "—"}</div>
                  </div>
                </div>
              )}
              {(lead.mlsListingAgent || lead.mlsListingAgentPhone) && (
                <div className="mt-3 pt-3 border-t flex items-center justify-between gap-3 text-xs" style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
                  <div>
                    Listing agent: {lead.mlsListingAgent ? <span className="font-medium" style={{ color: "#334155" }}>{lead.mlsListingAgent}</span> : <span className="italic">name not in import</span>}
                  </div>
                  {lead.mlsListingAgentPhone && (
                    <a href={`tel:${String(lead.mlsListingAgentPhone).replace(/\D/g, "")}`} className="font-mono px-2 py-1 rounded inline-flex items-center gap-1.5 hover:opacity-80 transition" style={{ background: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe" }} title="Agent direct line (not broker office)">
                      <Phone className="w-3 h-3" /> {lead.mlsListingAgentPhone}
                    </a>
                  )}
                </div>
              )}
              {lead.mlsStatus === "Sold" && (lead.mlsSellingAgent || lead.mlsSellingAgentPhone) && (
                <div className="mt-2 pt-2 flex items-center justify-between gap-3 text-xs" style={{ color: "#64748b" }}>
                  <div>
                    Selling agent <span className="text-[10px]" style={{ color: "#94a3b8" }}>(buyer's agent)</span>: {lead.mlsSellingAgent ? <span className="font-medium" style={{ color: "#334155" }}>{lead.mlsSellingAgent}</span> : <span className="italic">name not in import</span>}
                  </div>
                  {lead.mlsSellingAgentPhone && (
                    <a href={`tel:${String(lead.mlsSellingAgentPhone).replace(/\D/g, "")}`} className="font-mono px-2 py-1 rounded inline-flex items-center gap-1.5 hover:opacity-80 transition" style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }} title="Buyer's agent direct line — cash-buyer-list outreach path">
                      <Phone className="w-3 h-3" /> {lead.mlsSellingAgentPhone}
                    </a>
                  )}
                </div>
              )}
              {(lead.mlsStatus === "Expired" || lead.mlsStatus === "Canceled") && (
                <div className="mt-3 pt-3 border-t flex items-start gap-2 text-xs" style={{ borderColor: "#e2e8f0", color: "#15803d" }}>
                  <Star className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span><strong>High-intent lead.</strong> Seller tried to sell, didn't get a buyer, agent walked away. Listing agreement is no longer in force.</span>
                </div>
              )}
              {lead.mlsStatus === "Came Back" && (
                <div className="mt-3 pt-3 border-t flex items-start gap-2 text-xs" style={{ borderColor: "#e2e8f0", color: "#c2410c" }}>
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span><strong>Buyer fell through.</strong> Property was Pending and is now back to Active — seller momentum is real but direct outreach is still blocked while the listing agreement is in force.</span>
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl p-4 border" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
            <div className="text-xs font-bold tracking-wider mb-2" style={{ color: "#64748b" }}>SUBSCRIPTION TOOLS <span className="font-normal" style={{ color: "#94a3b8" }}>(login required)</span></div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <a href={buildRealForecloseUrl(lead)} target="_blank" rel="noopener noreferrer" className="col-span-2 px-3 py-2 rounded-lg border bg-white flex items-center justify-between hover:bg-green-50 transition" style={{ borderColor: "#bbf7d0", color: "#15803d" }}>
                <span className="font-medium flex items-center gap-1.5"><Gavel className="w-3.5 h-3.5" /> RealForeclose ★ (canonical Clerk auction source — same data PropertyOnion uses)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://propertyonion.com/" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg border bg-white flex items-center justify-between hover:bg-amber-50 transition" style={{ borderColor: "#fde68a", color: "#92400e" }}>
                <span className="font-medium flex items-center gap-1.5"><Gavel className="w-3.5 h-3.5" /> PropertyOnion (pre-FJ list)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href={buildRealistUrl()} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg border bg-white flex items-center justify-between hover:bg-blue-50 transition" style={{ borderColor: "#bfdbfe", color: "#1e40af" }}>
                <span className="font-medium flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5" /> Realist (mortgage data)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://www.imapp.com/" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg border bg-white flex items-center justify-between hover:bg-purple-50 transition" style={{ borderColor: "#ddd6fe", color: "#5b21b6" }}>
                <span className="font-medium flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> IMAPP (liens / violations)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://www.narrpr.com/" target="_blank" rel="noopener noreferrer" className="col-span-2 px-3 py-2 rounded-lg border bg-white flex items-center justify-between hover:bg-blue-50 transition" style={{ borderColor: "#bfdbfe", color: "#1e40af" }}>
                <span className="font-medium flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> NARRPR — Realtors Property Resource (ARV cross-check, demographics)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-xs font-bold tracking-wider mb-2" style={{ color: "#64748b" }}>QUICK LINKS — MIAMI-DADE PORTALS</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <PortalLink label="Property Appraiser" url={`https://apps.miamidadepa.gov/propertysearch/#/?folio=${lead.folio.replace(/-/g, "")}`} />
              <PortalLink label="Tax Collector" url={`https://www.miamidade.county-taxes.com/public/real_estate/parcels/${lead.folio.replace(/-/g, "")}`} />
              <PortalLink label="Clerk Official Records" url="https://onlineservices.miamidadeclerk.gov/officialrecords/StandardSearch.aspx" />
              <PortalLink label="Code Violations Map" url="https://gisweb.miamidade.gov/codeviolations/" />
              <PortalLink label="GIS e-Maps" url="https://gisweb.miamidade.gov/emaps/" />
              <PortalLink label="Foreclosure Registry" url="https://www.miamidade.gov/global/service.page?Mduid_service=ser1573834030253664" />
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex items-center gap-3" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
          <button
            onClick={blocked ? undefined : onCalc}
            disabled={blocked}
            title={blocked ? `Outreach disabled — ${lead.mlsStatus} on MLS` : ""}
            className="flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:cursor-not-allowed"
            style={{
              background: blocked ? "#e2e8f0" : "#2563eb",
              color: blocked ? "#94a3b8" : "white",
            }}
          >
            <Calculator className="w-4 h-4" /> {blocked ? `Locked — ${lead.mlsStatus} on MLS` : "Make Offer"}
          </button>
          <button onClick={onComp} className="flex-1 px-4 py-3 rounded-xl bg-white border font-semibold flex items-center justify-center gap-2" style={{ borderColor: "#e2e8f0", color: "#334155" }}>
            <MapPin className="w-4 h-4" /> Pull Comps
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="text-xs font-bold tracking-wider" style={{ color: "#64748b" }}>{label.toUpperCase()}</div>
      <div className="col-span-2 text-sm font-medium" style={{ color: "#0f172a" }}>{value}</div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// AUCTION DATA PANEL
// Renders the Final Judgment / auction info for Foreclosure & Tax leads, plus
// an inline edit form so the user can paste data from PropertyOnion in seconds.
// Verdict (PURSUE / PASS) is auto-computed from FJ vs PA Total Value.
// ----------------------------------------------------------------------------
function AuctionDataPanel({ lead, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const ad = lead.auctionData;
  const days = daysUntilAuction(ad?.auctionDate);
  const isTax = (hasListType(lead, "Tax Default") || hasListType(lead, "Tax Deed"));

  // No data yet — show empty state with quick-paste CTA
  if (!ad) {
    return (
      <div className="rounded-xl p-4 border border-dashed" style={{ borderColor: "#cbd5e1", background: "#f8fafc" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-bold tracking-wider" style={{ color: "#64748b" }}>
            AUCTION DATA — NOT YET RESEARCHED
          </div>
          <button onClick={() => setEditing(true)} className="text-[11px] font-bold px-3 py-1 rounded-lg" style={{ background: "#dbeafe", color: "#1e40af" }}>
            + Add Data
          </button>
        </div>
        <div className="text-xs mb-3" style={{ color: "#64748b" }}>
          {isTax ? "Pull the certificate amount, auction date, and case number from RealForeclose (canonical Clerk source) or PropertyOnion. Add PA Total Value from the Property Appraiser for the verdict to compute." : "Pull the Final Judgment, auction date, and case number from RealForeclose (canonical Clerk source) or PropertyOnion. Add the PA Total Value from the Property Appraiser — the dashboard compares them to compute PURSUE or PASS automatically."}
        </div>
        <div className="flex gap-2 mb-1">
          <a href={buildRealForecloseUrl(lead)} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-bold transition" style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}>
            Research on RealForeclose →
          </a>
          <a href="https://propertyonion.com/" target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-bold transition" style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
            Or PropertyOnion →
          </a>
        </div>
        {editing && <AuctionEditForm lead={lead} onSave={(data) => { onUpdate(data); setEditing(false); }} onCancel={() => setEditing(false)} />}
      </div>
    );
  }

  // Outcome takes precedence over PURSUE/PASS verdict — once an auction has
  // happened, the verdict is moot; the outcome is what matters.
  const outcomeMeta = ad.outcome ? {
    cancelled_bk:     { label: "CANCELLED — BANKRUPTCY", bg: "#bbf7d0", border: "#86efac", color: "#14532d" },
    cancelled_county: { label: "CANCELLED — COUNTY",     bg: "#bbf7d0", border: "#86efac", color: "#14532d" },
    buyer_walked:     { label: "BUYER WALKED AWAY",      bg: "#bbf7d0", border: "#86efac", color: "#14532d" },
    redeemed:         { label: "REDEEMED BY OWNER",      bg: "#fef3c7", border: "#fde68a", color: "#92400e" },
    sold:             { label: "SOLD AT AUCTION",        bg: "#fee2e2", border: "#fecaca", color: "#991b1b" },
  }[ad.outcome] : null;

  const verdictBg = outcomeMeta ? outcomeMeta.bg : (ad.verdict === "PURSUE" ? "#f0fdf4" : "#fef2f2");
  const verdictBorder = outcomeMeta ? outcomeMeta.border : (ad.verdict === "PURSUE" ? "#bbf7d0" : "#fecaca");
  const headerColor = outcomeMeta ? outcomeMeta.color : ad.color;
  const headerLabel = outcomeMeta ? outcomeMeta.label : ad.verdict;

  return (
    <div className="rounded-xl p-4 border" style={{ borderColor: verdictBorder, background: verdictBg }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gavel className="w-4 h-4" style={{ color: headerColor }} />
          <div className="text-[11px] font-bold tracking-wider" style={{ color: headerColor }}>
            {isTax ? "TAX DEED AUCTION" : "FORECLOSURE AUCTION"} — {headerLabel}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ad.source && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{
              background: ad.source === "RealForeclose" ? "#dcfce7" : "#fef3c7",
              color: ad.source === "RealForeclose" ? "#15803d" : "#854d0e",
            }}>
              {ad.source}
            </span>
          )}
          <a href={buildRealForecloseUrl(lead)} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1" style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }} title="Verify on RealForeclose (canonical Clerk source)">
            RealForeclose <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <button onClick={() => setEditing(!editing)} className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: "white", color: "#475569", border: "1px solid #cbd5e1" }}>
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      {!editing && (
        <>
          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div className="rounded-lg p-3" style={{ background: "white", border: `1px solid ${verdictBorder}` }}>
              <span className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>{isTax ? "CERTIFICATE AMOUNT" : "FINAL JUDGMENT"}</span>
              <div className="font-bold text-[18px] mt-0.5" style={{ color: "#0f172a" }}>{fmtMoney(ad.finalJudgment)}</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: "white", border: `1px solid ${verdictBorder}` }}>
              <span className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>PA TOTAL VALUE <span className="font-normal">(county)</span></span>
              <div className="font-bold text-[18px] mt-0.5" style={{ color: "#0f172a" }}>{ad.paTotalValue ? fmtMoney(ad.paTotalValue) : "—"}</div>
            </div>
          </div>

          {ad.paTotalValue && (
            <div className="rounded-lg p-3 mb-3" style={{ background: "white", border: `2px solid ${verdictBorder}` }}>
              <div className="text-[10px] font-bold tracking-wider mb-2" style={{ color: "#64748b" }}>VERDICT — FJ vs PA TOTAL VALUE</div>
              <div className="flex items-baseline gap-4 mb-2">
                <div>
                  <span className="text-[10px] font-bold" style={{ color: "#64748b" }}>FJ / PA</span>
                  <div className="font-mono font-bold text-[28px] leading-none mt-1" style={{ color: ad.color }}>
                    {ad.fjVsPaPct?.toFixed(1)}<span className="text-[18px]">%</span>
                  </div>
                </div>
                <div className="flex-1 border-l pl-4" style={{ borderColor: "#e2e8f0" }}>
                  <span className="text-[10px] font-bold" style={{ color: "#64748b" }}>Verdict</span>
                  <div className="font-bold text-[18px] leading-tight mt-0.5" style={{ color: ad.color }}>
                    {ad.verdict === "PURSUE" && "★ "}{ad.verdict}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>
                    {ad.equityCushion >= 0
                      ? `${fmtMoney(ad.equityCushion)} below PA Total Value`
                      : `${fmtMoney(Math.abs(ad.equityCushion))} above PA Total Value`}
                  </div>
                </div>
              </div>
              <div className="text-[10px] mt-2 pt-2 border-t leading-relaxed" style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
                <strong>Rule:</strong> FJ ≤ PA Total Value → PURSUE · FJ &gt; PA Total Value → PASS
              </div>
            </div>
          )}

          {ad.arvEstimate && (
            <div className="rounded-lg p-3 mb-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div className="text-[10px] font-bold tracking-wider mb-2 flex items-center gap-2" style={{ color: "#64748b" }}>
                SECONDARY CONTEXT — ARV-BASED MATH
                <span className="text-[9px] font-normal px-1.5 py-0.5 rounded" style={{ background: "#fef3c7", color: "#854d0e" }}>not the primary verdict</span>
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
                <div className="flex flex-col">
                  <span style={{ color: "#64748b" }}>ARV Estimate</span>
                  <span className="font-mono font-bold" style={{ color: "#0f172a" }}>{fmtMoney(ad.arvEstimate)}</span>
                </div>
                <div className="flex flex-col">
                  <span style={{ color: "#64748b" }}>Repairs</span>
                  <span className="font-mono font-bold" style={{ color: "#0f172a" }}>{fmtMoney(ad.repairsEstimate || 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span style={{ color: "#64748b" }}>Max Spread (70%)</span>
                  <span className="font-mono font-bold" style={{ color: ad.maxSpread >= 0 ? "#15803d" : "#991b1b" }}>{ad.maxSpread >= 0 ? "" : "−"}{fmtMoney(Math.abs(ad.maxSpread || 0))}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm mb-2">
            <div>
              <span className="text-xs" style={{ color: "#64748b" }}>Plaintiff</span>
              <div className="font-bold text-xs" style={{ color: "#0f172a" }}>{ad.plaintiff || "—"}</div>
            </div>
            <div>
              <span className="text-xs" style={{ color: "#64748b" }}>Case Number</span>
              <div className="font-mono font-bold text-xs" style={{ color: "#0f172a" }}>{ad.caseNumber || "—"}</div>
            </div>
            <div>
              <span className="text-xs" style={{ color: "#64748b" }}>Auction Date</span>
              <div className="font-bold text-xs" style={{ color: "#0f172a" }}>
                {ad.auctionDate || "—"}
                {days !== null && days >= 0 && (
                  <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{
                    background: days <= 7 ? "#fee2e2" : days <= 30 ? "#fef2f2" : "#f1f5f9",
                    color: days <= 7 ? "#991b1b" : days <= 30 ? "#dc2626" : "#475569",
                  }}>
                    {days <= 30 && "⏰ "}{days}d out
                  </span>
                )}
              </div>
            </div>
          </div>

          {ad.verdict === "PURSUE" && (
            <div className="text-xs leading-relaxed mt-3 pt-3 border-t" style={{ borderColor: "#bbf7d0", color: "#15803d" }}>
              <strong>This is worth pursuing.</strong> Final Judgment is at or below the PA Total Value of {fmtMoney(ad.paTotalValue)} ({ad.fjVsPaPct?.toFixed(1)}% of PA). Standard play: contact the owner pre-auction, offer to buy at a price that pays off the FJ and leaves them with cash. PA Total Value typically runs 10-20% below actual market in Miami-Dade, so real-world equity is likely larger than the headline number suggests.
            </div>
          )}
          {ad.verdict === "PASS" && (
            <div className="text-xs leading-relaxed mt-3 pt-3 border-t" style={{ borderColor: "#fecaca", color: "#991b1b" }}>
              <strong>Recommend pass.</strong> Final Judgment is {ad.fjVsPaPct?.toFixed(1)}% of the PA Total Value ({fmtMoney(ad.paTotalValue)}) — anything above 100% eats into the minimum wholesale profit margin. Move on to higher-equity leads.
            </div>
          )}
        </>
      )}

      {editing && <AuctionEditForm lead={lead} onSave={(data) => { onUpdate(data); setEditing(false); }} onCancel={() => setEditing(false)} />}
    </div>
  );
}

function AuctionEditForm({ lead, onSave, onCancel }) {
  const ad = lead.auctionData || {};
  const [fj, setFj] = useState(ad.finalJudgment || "");
  const [paTotalValue, setPaTotalValue] = useState(ad.paTotalValue || "");
  const [arv, setArv] = useState(ad.arvEstimate || "");
  const [repairs, setRepairs] = useState(ad.repairsEstimate || "");
  const [auctionDate, setAuctionDate] = useState(ad.auctionDate || "");
  const [plaintiff, setPlaintiff] = useState(ad.plaintiff || "");
  const [caseNum, setCaseNum] = useState(ad.caseNumber || "");
  const [certAmt, setCertAmt] = useState(ad.certificateAmount || "");
  const [source, setSource] = useState(ad.source || "RealForeclose");
  const isTax = (hasListType(lead, "Tax Default") || hasListType(lead, "Tax Deed"));

  const handleSave = () => {
    onSave({
      finalJudgment: Number(fj) || 0,
      paTotalValue: Number(paTotalValue) || 0,
      arvEstimate: Number(arv) || 0,
      repairsEstimate: Number(repairs) || 0,
      auctionDate: auctionDate || null,
      plaintiff: plaintiff || null,
      caseNumber: caseNum || null,
      certificateAmount: isTax ? (Number(certAmt) || 0) : undefined,
      source: source || "Manual entry",
      importedAt: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="mt-3 pt-3 border-t space-y-3" style={{ borderColor: "#e2e8f0" }}>
      <div>
        <label className="text-[10px] font-bold tracking-wider mb-1.5 block" style={{ color: "#64748b" }}>DATA SOURCE</label>
        <div className="flex gap-1.5">
          {["RealForeclose", "PropertyOnion", "Manual entry"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSource(s)}
              className="px-3 py-1.5 rounded text-[11px] font-bold border transition"
              style={{
                background: source === s ? (s === "RealForeclose" ? "#dcfce7" : s === "PropertyOnion" ? "#fef3c7" : "#e2e8f0") : "white",
                color: source === s ? (s === "RealForeclose" ? "#15803d" : s === "PropertyOnion" ? "#854d0e" : "#475569") : "#94a3b8",
                borderColor: source === s ? (s === "RealForeclose" ? "#bbf7d0" : s === "PropertyOnion" ? "#fde68a" : "#cbd5e1") : "#e2e8f0",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg p-3" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
        <div className="text-[10px] font-bold tracking-wider mb-2" style={{ color: "#1e40af" }}>PRIMARY — VERDICT INPUTS</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>{isTax ? "CERTIFICATE AMT" : "FINAL JUDGMENT"} <span className="text-red-500">*</span></label>
            <input type="number" value={isTax ? certAmt : fj} onChange={(e) => isTax ? setCertAmt(e.target.value) : setFj(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm font-mono" style={{ borderColor: "#cbd5e1" }} placeholder="from RealForeclose / PropertyOnion" />
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>PA TOTAL VALUE <span className="text-red-500">*</span></label>
            <input type="number" value={paTotalValue} onChange={(e) => setPaTotalValue(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm font-mono" style={{ borderColor: "#cbd5e1" }} placeholder="from PA roll" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>AUCTION DATE</label>
          <input type="date" value={auctionDate} onChange={(e) => setAuctionDate(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm" style={{ borderColor: "#cbd5e1" }} />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>ARV ESTIMATE <span className="font-normal text-[9px]">(optional, secondary)</span></label>
          <input type="number" value={arv} onChange={(e) => setArv(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm font-mono" style={{ borderColor: "#cbd5e1" }} placeholder="from Comp Tool" />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>REPAIRS <span className="font-normal text-[9px]">(optional)</span></label>
          <input type="number" value={repairs} onChange={(e) => setRepairs(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm font-mono" style={{ borderColor: "#cbd5e1" }} placeholder="e.g. 35000" />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>PLAINTIFF</label>
          <input type="text" value={plaintiff} onChange={(e) => setPlaintiff(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm" style={{ borderColor: "#cbd5e1" }} placeholder="e.g. Wells Fargo Bank NA" />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>CASE #</label>
          <input type="text" value={caseNum} onChange={(e) => setCaseNum(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm font-mono" style={{ borderColor: "#cbd5e1" }} placeholder="e.g. 2025-1234-CA-01" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: "#f1f5f9", color: "#475569" }}>Cancel</button>
        <button onClick={handleSave} className="px-3 py-1.5 rounded text-xs font-bold text-white" style={{ background: "#2563eb" }}>Save & Recompute</button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MORTGAGE INFO PANEL — forward-mortgage data, typically pulled from Realist.
// Distinct from the Reverse Mortgage panel (which is HECM-specific).
// Useful for non-foreclosure leads where you want to know how much equity
// the owner has before reaching out.
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// CODE VIOLATIONS PANEL — lazy-loads from the live ArcGIS REST API on mount.
// First true API integration in the dashboard.
// ----------------------------------------------------------------------------
function CodeViolationsPanel({ lead, apiConfig, cache, onCacheUpdate }) {
  const cached = cache[normalizeFolio(lead.folio) || lead.folio];
  const [loading, setLoading] = useState(!cached);
  const [violations, setViolations] = useState(cached?.violations || []);
  const [error, setError] = useState(cached?.error || null);

  useEffect(() => {
    if (cached) return; // already loaded for this folio
    let cancelled = false;
    setLoading(true);
    fetchCodeViolations(lead.folio, apiConfig).then(({ violations, error }) => {
      if (cancelled) return;
      setViolations(violations);
      setError(error);
      setLoading(false);
      onCacheUpdate(lead.folio, { violations, error });
    });
    return () => { cancelled = true; };
  }, [lead.folio]);

  const refetch = () => {
    setLoading(true);
    setError(null);
    fetchCodeViolations(lead.folio, apiConfig).then(({ violations, error }) => {
      setViolations(violations);
      setError(error);
      setLoading(false);
      onCacheUpdate(lead.folio, { violations, error });
    });
  };

  const active = violations.filter((v) => isViolationActive(v, apiConfig));
  const resolved = violations.filter((v) => !isViolationActive(v, apiConfig));
  const totalFines = violations.reduce((sum, v) => sum + (v.fine || 0), 0);
  const activeFines = active.reduce((sum, v) => sum + (v.fine || 0), 0);

  // Miami-Dade's purpose-built Code Violations map app — better tool than the
  // raw open data hub explorer for actual violation lookup.
  const gisHubUrl = `https://gisweb.miamidade.gov/codeviolations/`;

  return (
    <div className="rounded-xl p-4 border" style={{
      borderColor: active.length > 0 ? "#fecaca" : "#e2e8f0",
      background: active.length > 0 ? "#fef2f2" : "#f8fafc",
    }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" style={{ color: active.length > 0 ? "#dc2626" : "#64748b" }} />
          <div className="text-[11px] font-bold tracking-wider" style={{ color: active.length > 0 ? "#991b1b" : "#475569" }}>
            CODE VIOLATIONS{loading ? " — LOADING…" : active.length > 0 ? ` ★ ${active.length} ACTIVE` : violations.length > 0 ? ` — ${violations.length} (ALL RESOLVED)` : " — NONE FOUND"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#dcfce7", color: "#15803d" }}>LIVE API</span>
          <button onClick={refetch} className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: "white", color: "#475569", border: "1px solid #cbd5e1" }} title="Refetch from Miami-Dade GIS">
            ↻
          </button>
          <a href={gisHubUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1" style={{ background: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe" }}>
            GIS Map <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {error && (
        <div className="rounded p-2.5 mb-2 text-xs" style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
          <strong>API error:</strong> {error}
          <div className="mt-1 text-[10px]">
            Verify the endpoint URL in Settings → Code Violations API. Open the URL in a browser to confirm it returns JSON; common issues: wrong layer index, wrong folio field name, or CORS.
          </div>
        </div>
      )}

      {!loading && !error && violations.length === 0 && (
        <div className="text-xs" style={{ color: "#64748b" }}>
          No code violations on file for folio {lead.folio}. Clean record.
        </div>
      )}

      {violations.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded p-2" style={{ background: "white", border: `1px solid ${active.length > 0 ? "#fecaca" : "#e2e8f0"}` }}>
              <div className="text-[9px] font-bold tracking-wider" style={{ color: "#64748b" }}>ACTIVE</div>
              <div className="font-mono font-bold text-[16px]" style={{ color: active.length > 0 ? "#dc2626" : "#475569" }}>{active.length}</div>
            </div>
            <div className="rounded p-2" style={{ background: "white", border: "1px solid #e2e8f0" }}>
              <div className="text-[9px] font-bold tracking-wider" style={{ color: "#64748b" }}>RESOLVED</div>
              <div className="font-mono font-bold text-[16px]" style={{ color: "#475569" }}>{resolved.length}</div>
            </div>
            <div className="rounded p-2" style={{ background: "white", border: "1px solid #e2e8f0" }}>
              <div className="text-[9px] font-bold tracking-wider" style={{ color: "#64748b" }}>TOTAL FINES</div>
              <div className="font-mono font-bold text-[16px]" style={{ color: totalFines > 0 ? "#dc2626" : "#475569" }}>{fmtMoney(totalFines)}</div>
              {activeFines > 0 && activeFines !== totalFines && (
                <div className="text-[9px]" style={{ color: "#dc2626" }}>{fmtMoney(activeFines)} active</div>
              )}
            </div>
          </div>

          {/* Violations grouped by target category */}
          {(() => {
            const summary = summarizeViolations(violations, apiConfig);
            const orderedCategories = [
              ...VIOLATION_CATEGORIES.map((c) => c.key),
              "OTHER",
            ];
            // Collect active playbooks ONCE per unique tag so multi-tag leads
            // don't repeat the same coaching text.
            const activePlaybooks = [];
            const seenPlaybookKeys = new Set();
            for (const catKey of orderedCategories) {
              const bucket = summary.byCategory[catKey];
              if (!bucket || bucket.active === 0) continue;
              const cat = VIOLATION_CATEGORIES.find((c) => c.key === catKey);
              if (!cat || seenPlaybookKeys.has(cat.key)) continue;
              seenPlaybookKeys.add(cat.key);
              activePlaybooks.push(cat);
            }

            return (
              <>
                {orderedCategories.map((catKey) => {
                  const bucket = summary.byCategory[catKey];
                  if (!bucket || bucket.items.length === 0) return null;
                  const cat = VIOLATION_CATEGORIES.find((c) => c.key === catKey);
                  const isOther = catKey === "OTHER";
                  const heading = isOther ? "Other (non-target) violations" : cat.label;
                  return (
                    <div key={catKey} className="mb-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: isOther ? "#94a3b8" : cat.color }}></span>
                        <span className="text-[11px] font-bold tracking-wider" style={{ color: isOther ? "#64748b" : cat.color }}>
                          {heading.toUpperCase()} {bucket.active > 0 && <span>★ {bucket.active} ACTIVE</span>}{bucket.resolved > 0 && <span className="font-normal" style={{ color: "#64748b" }}> · {bucket.resolved} resolved</span>}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {bucket.items.slice(0, 8).map((v, i) => (
                          <div key={i} className="rounded p-2 text-[11px]" style={{
                            background: "white",
                            border: `1px solid ${v._isActive ? (isOther ? "#fecaca" : cat.borderColor) : "#e2e8f0"}`,
                          }}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-mono font-bold truncate" style={{ color: "#0f172a" }}>
                                  {v.caseNumber || "(no case #)"} · {v.type || "Code Violation"}
                                </div>
                                {v.description && v.description !== v.type && (
                                  <div className="text-[10px] mt-0.5 truncate" style={{ color: "#64748b" }}>{v.description}</div>
                                )}
                                <div className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>
                                  {v.issueDate || "—"} {v.status && <span>· <span className="font-bold" style={{ color: v._isActive ? "#dc2626" : "#15803d" }}>{v.status}</span></span>}
                                </div>
                              </div>
                              {v.fine > 0 && (
                                <div className="font-mono font-bold whitespace-nowrap" style={{ color: v._isActive ? "#dc2626" : "#475569" }}>
                                  {fmtMoney(v.fine)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {bucket.items.length > 8 && (
                          <div className="text-[10px] text-center" style={{ color: "#64748b" }}>
                            {bucket.items.length - 8} more in this category — open GIS Map for full list
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Consolidated playbook section — one playbook per unique active tag */}
                {activePlaybooks.length > 0 && (
                  <div className="mt-4 pt-3 border-t" style={{ borderColor: "#e2e8f0" }}>
                    <div className="text-[11px] font-bold tracking-wider mb-2" style={{ color: "#475569" }}>
                      OUTREACH PLAYBOOKS {activePlaybooks.length > 1 && <span className="font-normal">· {activePlaybooks.length} TAGS ACTIVE</span>}
                    </div>
                    <div className="space-y-2">
                      {activePlaybooks.map((cat) => (
                        <div key={cat.key} className="text-[11px] leading-relaxed p-2.5 rounded" style={{ background: cat.bgColor, color: cat.color, border: `1px solid ${cat.borderColor}` }}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: cat.color }}></span>
                            <strong className="text-[10px] tracking-wider">{cat.label.toUpperCase()}</strong>
                          </div>
                          {cat.playbook}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}

function MortgageInfoPanel({ lead, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const m = lead.mortgageInfo;

  if (!m && !editing) {
    return (
      <div className="rounded-xl p-4 border border-dashed" style={{ borderColor: "#cbd5e1", background: "#f8fafc" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-bold tracking-wider" style={{ color: "#64748b" }}>
            MORTGAGE INFO — NOT YET RESEARCHED
          </div>
          <button onClick={() => setEditing(true)} className="text-[11px] font-bold px-3 py-1 rounded-lg" style={{ background: "#dbeafe", color: "#1e40af" }}>
            + Add from Realist
          </button>
        </div>
        <div className="text-xs mb-3" style={{ color: "#64748b" }}>
          Pull recorded mortgage details from Realist (or any title-search tool you have access to). Useful for estimating how much equity the owner has before outreach — high equity = motivated seller has room to negotiate.
        </div>
        <a href={buildRealistUrl()} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-2 rounded-lg text-xs font-bold" style={{ background: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe" }}>
          Open Realist →
        </a>
      </div>
    );
  }

  if (editing && !m) {
    return (
      <div className="rounded-xl p-4 border" style={{ borderColor: "#bfdbfe", background: "#eff6ff" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-bold tracking-wider" style={{ color: "#1e40af" }}>ADD MORTGAGE INFO</div>
        </div>
        <MortgageEditForm m={null} onSave={(d) => { onUpdate(d); setEditing(false); }} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  // Equity math when we have ARV-like reference and current balance
  const paTotalValue = lead.auctionData?.paTotalValue;
  const equity = (paTotalValue && m?.currentBalance) ? paTotalValue - m.currentBalance : null;
  const equityPct = equity !== null && paTotalValue ? equity / paTotalValue : null;

  return (
    <div className="rounded-xl p-4 border" style={{ borderColor: "#bfdbfe", background: "#eff6ff" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4" style={{ color: "#1e40af" }} />
          <div className="text-[11px] font-bold tracking-wider" style={{ color: "#1e40af" }}>
            MORTGAGE INFO
          </div>
        </div>
        <div className="flex items-center gap-2">
          {m?.source && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#dbeafe", color: "#1e40af" }}>{m.source}</span>}
          <button onClick={() => setEditing(!editing)} className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: "white", color: "#475569", border: "1px solid #cbd5e1" }}>
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>
      {!editing && (
        <>
          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <span className="text-xs" style={{ color: "#64748b" }}>Lender</span>
              <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{m.lender || "—"}</div>
              {m.recordedDate && <div className="text-[10px]" style={{ color: "#64748b" }}>recorded {m.recordedDate}</div>}
            </div>
            <div>
              <span className="text-xs" style={{ color: "#64748b" }}>Lien Position</span>
              <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{m.lienPosition || "—"}</div>
              {m.lastPaymentStatus && (
                <div className="text-[10px]" style={{ color: m.lastPaymentStatus === "current" ? "#15803d" : "#dc2626" }}>
                  {m.lastPaymentStatus}
                </div>
              )}
            </div>
            <div>
              <span className="text-xs" style={{ color: "#64748b" }}>Original Loan</span>
              <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{m.originalLoan ? fmtMoney(m.originalLoan) : "—"}</div>
            </div>
            <div>
              <span className="text-xs" style={{ color: "#64748b" }}>Current Balance (est)</span>
              <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{m.currentBalance ? fmtMoney(m.currentBalance) : "—"}</div>
            </div>
          </div>
          {equity !== null && (
            <div className="rounded p-2.5" style={{ background: equityPct >= 0.4 ? "#dcfce7" : equityPct >= 0.2 ? "#fef3c7" : "#fee2e2" }}>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold" style={{ color: "#64748b" }}>EQUITY (vs PA Total Value)</span>
                  <div className="font-mono font-bold text-[14px]" style={{ color: equity >= 0 ? "#15803d" : "#991b1b" }}>{equity >= 0 ? "" : "−"}{fmtMoney(Math.abs(equity))}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold" style={{ color: "#64748b" }}>EQUITY %</span>
                  <div className="font-mono font-bold text-[14px]" style={{ color: equity >= 0 ? "#15803d" : "#991b1b" }}>{(equityPct * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}
          {m.notes && (
            <div className="text-[11px] mt-3 pt-3 border-t" style={{ borderColor: "#bfdbfe", color: "#1e40af" }}>
              <strong>Notes:</strong> {m.notes}
            </div>
          )}
        </>
      )}
      {editing && <MortgageEditForm m={m} onSave={(d) => { onUpdate(d); setEditing(false); }} onCancel={() => setEditing(false)} />}
    </div>
  );
}

function MortgageEditForm({ m, onSave, onCancel }) {
  const [lender, setLender] = useState(m?.lender || "");
  const [originalLoan, setOriginalLoan] = useState(m?.originalLoan || "");
  const [currentBalance, setCurrentBalance] = useState(m?.currentBalance || "");
  const [recordedDate, setRecordedDate] = useState(m?.recordedDate || "");
  const [lienPosition, setLienPosition] = useState(m?.lienPosition || "1st");
  const [lastPaymentStatus, setLastPaymentStatus] = useState(m?.lastPaymentStatus || "");
  const [notes, setNotes] = useState(m?.notes || "");
  const handleSave = () => {
    onSave({
      lender: lender || null,
      originalLoan: Number(originalLoan) || null,
      currentBalance: Number(currentBalance) || null,
      recordedDate: recordedDate || null,
      lienPosition: lienPosition || null,
      lastPaymentStatus: lastPaymentStatus || null,
      notes: notes || null,
      source: "Realist",
      importedAt: new Date().toISOString().slice(0, 10),
    });
  };
  return (
    <div className="space-y-3 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>LENDER</label>
          <input type="text" value={lender} onChange={(e) => setLender(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm" style={{ borderColor: "#cbd5e1" }} placeholder="e.g. Wells Fargo Bank NA" />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>RECORDED DATE</label>
          <input type="date" value={recordedDate} onChange={(e) => setRecordedDate(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm" style={{ borderColor: "#cbd5e1" }} />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>ORIGINAL LOAN</label>
          <input type="number" value={originalLoan} onChange={(e) => setOriginalLoan(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm font-mono" style={{ borderColor: "#cbd5e1" }} placeholder="e.g. 250000" />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>CURRENT BALANCE (est)</label>
          <input type="number" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm font-mono" style={{ borderColor: "#cbd5e1" }} placeholder="estimate from recorded + paydown" />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>LIEN POSITION</label>
          <select value={lienPosition} onChange={(e) => setLienPosition(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm" style={{ borderColor: "#cbd5e1" }}>
            <option value="1st">1st</option>
            <option value="2nd">2nd</option>
            <option value="HELOC">HELOC</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>PAYMENT STATUS</label>
          <select value={lastPaymentStatus} onChange={(e) => setLastPaymentStatus(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm" style={{ borderColor: "#cbd5e1" }}>
            <option value="">—</option>
            <option value="current">Current</option>
            <option value="30 days late">30 days late</option>
            <option value="60 days late">60 days late</option>
            <option value="90+ days late">90+ days late</option>
            <option value="in default">In default</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold tracking-wider" style={{ color: "#64748b" }}>NOTES</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm" rows="2" style={{ borderColor: "#cbd5e1" }} placeholder="Additional liens, second mortgage, HELOC, etc." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: "#f1f5f9", color: "#475569" }}>Cancel</button>
        <button onClick={handleSave} className="px-3 py-1.5 rounded text-xs font-bold text-white" style={{ background: "#1e40af" }}>Save</button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// REVERSE MORTGAGE PANEL — recorded principal + lender + manually-entered
// actual loan amount and current balance.
// ----------------------------------------------------------------------------
function ReverseMortgagePanel({ lead, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const rm = lead.reverseMortgage;
  const yearsSince = rm?.recordedDate ? Math.floor((new Date("2026-05-07") - new Date(rm.recordedDate)) / (1000 * 60 * 60 * 24 * 365)) : null;

  return (
    <div className="rounded-xl p-4 border" style={{ borderColor: "#ddd6fe", background: "#faf5ff" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4" style={{ color: "#7c3aed" }} />
          <div className="text-[11px] font-bold tracking-wider" style={{ color: "#5b21b6" }}>
            REVERSE MORTGAGE — RECORDED {rm.recordedDate}
          </div>
        </div>
        <button onClick={() => setEditing(!editing)} className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: "white", color: "#5b21b6", border: "1px solid #ddd6fe" }}>
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      {!editing && (
        <>
          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <span className="text-xs" style={{ color: "#5b21b6" }}>Lender</span>
              <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{rm.lender}</div>
              {yearsSince !== null && (
                <div className="text-[10px]" style={{ color: "#5b21b6" }}>{yearsSince} years ago</div>
              )}
            </div>
            <div>
              <span className="text-xs" style={{ color: "#5b21b6" }}>Recorded Principal</span>
              <div className="font-bold text-[13px]" style={{ color: rm.usesDocStampWorkaround ? "#dc2626" : "#0f172a" }}>
                {fmtMoney(rm.recordedPrincipal)}
              </div>
              {rm.usesDocStampWorkaround && (
                <div className="text-[10px]" style={{ color: "#dc2626" }}>⚠ doc-stamp workaround — actual amount on HUD-1</div>
              )}
            </div>
          </div>

          {(rm.actualLoanAmount || rm.currentBalance) ? (
            <div className="rounded p-2.5 mb-3" style={{ background: "#ede9fe" }}>
              <div className="text-[10px] font-bold tracking-wider mb-1.5" style={{ color: "#5b21b6" }}>RESEARCHED LOAN INFO</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs" style={{ color: "#5b21b6" }}>Original Loan Amount</span>
                  <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{rm.actualLoanAmount ? fmtMoney(rm.actualLoanAmount) : "—"}</div>
                </div>
                <div>
                  <span className="text-xs" style={{ color: "#5b21b6" }}>Current Balance (estimated)</span>
                  <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{rm.currentBalance ? fmtMoney(rm.currentBalance) : "—"}</div>
                </div>
              </div>
              {rm.notes && (
                <div className="text-[11px] mt-2 pt-2 border-t" style={{ borderColor: "#ddd6fe", color: "#5b21b6" }}>
                  <strong>Notes:</strong> {rm.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded border-dashed border p-2.5 mb-3 text-xs" style={{ borderColor: "#cbd5e1", background: "#f8fafc", color: "#64748b" }}>
              <strong>Not yet researched.</strong> Click Edit to add the actual loan amount + current balance from the HUD-1 / HECM Closing Disclosure.
            </div>
          )}

          <div className="text-xs leading-relaxed" style={{ color: "#5b21b6" }}>
            <strong>What this means:</strong> Owner has a Home Equity Conversion Mortgage. Borrower is 62+, lives on fixed income, doesn't make monthly payments — interest accrues against the property. When the borrower dies or moves into assisted living, heirs have ~6 months (extensible to 12) to pay off the loan or sell. This is a predictable forced-sale catalyst.
          </div>
          <div className="mt-2 text-xs leading-relaxed" style={{ color: "#5b21b6" }}>
            <strong>Outreach play:</strong> The current borrower is rarely the right contact — they're usually content. The play is to identify {"adult children / heirs"} now (skip-trace owner's relatives), build the relationship before the maturity event, and be the first call when the heirs need to sell. Pair with EST OF / Possible EST OF / Senior tags to find leads where the maturity event may be near.
          </div>
        </>
      )}

      {editing && <ReverseMortgageEditForm rm={rm} onSave={(data) => { onUpdate(data); setEditing(false); }} onCancel={() => setEditing(false)} />}
    </div>
  );
}

function ReverseMortgageEditForm({ rm, onSave, onCancel }) {
  const [actualLoan, setActualLoan] = useState(rm?.actualLoanAmount || "");
  const [currentBalance, setCurrentBalance] = useState(rm?.currentBalance || "");
  const [notes, setNotes] = useState(rm?.notes || "");
  const handleSave = () => {
    onSave({
      actualLoanAmount: Number(actualLoan) || null,
      currentBalance: Number(currentBalance) || null,
      notes: notes || null,
    });
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold tracking-wider" style={{ color: "#5b21b6" }}>ORIGINAL LOAN AMOUNT</label>
          <input type="number" value={actualLoan} onChange={(e) => setActualLoan(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm font-mono" style={{ borderColor: "#cbd5e1" }} placeholder="from HUD-1 / HECM disclosure" />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-wider" style={{ color: "#5b21b6" }}>CURRENT BALANCE (ESTIMATED)</label>
          <input type="number" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm font-mono" style={{ borderColor: "#cbd5e1" }} placeholder="actual + accrued interest" />
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold tracking-wider" style={{ color: "#5b21b6" }}>NOTES</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-2 py-1.5 rounded border text-sm" rows="2" style={{ borderColor: "#cbd5e1" }} placeholder="Heirs identified, owner age, last contact, etc." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: "#f1f5f9", color: "#475569" }}>Cancel</button>
        <button onClick={handleSave} className="px-3 py-1.5 rounded text-xs font-bold text-white" style={{ background: "#7c3aed" }}>Save</button>
      </div>
    </div>
  );
}

function PortalLink({ label, url }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg border bg-white flex items-center justify-between hover:bg-slate-50 transition" style={{ borderColor: "#e2e8f0", color: "#2563eb" }}>
      <span className="font-medium">{label}</span>
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

// ----------------------------------------------------------------------------
// DEAL CALCULATOR
// ----------------------------------------------------------------------------
function DealCalculatorModal({ initialLead, initialArv, onClose }) {
  const [arv, setArv] = useState(initialArv || (initialLead ? 525000 : 350000));
  const [repairs, setRepairs] = useState(45000);
  const [mao, setMao] = useState(70);
  const [closing, setClosing] = useState(3);
  const [holding, setHolding] = useState(2);
  const [profit, setProfit] = useState(25000);
  const [assignmentFee, setAssignmentFee] = useState(15000);
  const [arvFromComps] = useState(!!initialArv);

  const maxOffer70 = arv * (mao / 100) - repairs;
  const closingCost = arv * (closing / 100);
  const holdingCost = arv * (holding / 100);
  const fixFlipMao = arv - repairs - closingCost - holdingCost - profit;
  const wholesaleOffer = maxOffer70 - assignmentFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "#e2e8f0" }}>
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6" style={{ color: "#2563eb" }} />
            <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>Deal Calculator</h2>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#64748b" }} /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-xs font-bold tracking-wider" style={{ color: "#64748b" }}>INPUTS</div>
            {arvFromComps && (
              <div className="rounded-lg p-2.5 flex items-center gap-2 text-xs" style={{ background: "#dcfce7", color: "#166534" }}>
                <MapPin className="w-3.5 h-3.5" /> <span><strong>ARV pulled from Comp Tool</strong> — median of filtered closed sales</span>
              </div>
            )}
            <CalcInput label="ARV (After Repair Value)" prefix="$" value={arv} onChange={setArv} />
            <CalcInput label="Estimated Repairs" prefix="$" value={repairs} onChange={setRepairs} />
            <CalcInput label="Max Allowable Offer %" suffix="%" value={mao} onChange={setMao} />
            <CalcInput label="Closing Costs %" suffix="%" value={closing} onChange={setClosing} step={0.5} />
            <CalcInput label="Holding Costs %" suffix="%" value={holding} onChange={setHolding} step={0.5} />
            <CalcInput label="Desired Profit" prefix="$" value={profit} onChange={setProfit} />
            <CalcInput label="Assignment Fee (Wholesale)" prefix="$" value={assignmentFee} onChange={setAssignmentFee} />
          </div>
          <div className="space-y-3">
            <div className="text-xs font-bold tracking-wider" style={{ color: "#64748b" }}>RESULTS</div>
            <ResultBox label="Max Offer (70% Rule)" value={maxOffer70} primary />
            <ResultBox label="Wholesale Offer to Seller" value={wholesaleOffer} highlight />
            <ResultBox label="Fix & Flip MAO (with profit target)" value={fixFlipMao} />
            <ResultBox label="Estimated Closing Costs" value={closingCost} small />
            <ResultBox label="Estimated Holding Costs" value={holdingCost} small />
            <div className="rounded-lg p-3 text-xs leading-relaxed" style={{ background: "#eff6ff", color: "#1e40af" }}>
              <strong>Wholesaler workflow:</strong> Offer the seller <strong>{fmtMoney(wholesaleOffer)}</strong>, assign to a cash buyer at <strong>{fmtMoney(maxOffer70)}</strong>, profit ≈ <strong>{fmtMoney(assignmentFee)}</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalcInput({ label, prefix, suffix, value, onChange, step = 1 }) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block" style={{ color: "#475569" }}>{label}</label>
      <div className="flex items-center rounded-lg border" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
        {prefix && <span className="pl-3 pr-1 text-sm" style={{ color: "#64748b" }}>{prefix}</span>}
        <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 px-2 py-2 bg-transparent outline-none text-sm font-medium" />
        {suffix && <span className="pr-3 text-sm" style={{ color: "#64748b" }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ResultBox({ label, value, primary, highlight, small }) {
  const bg = highlight ? "linear-gradient(135deg,#16a34a,#15803d)" : primary ? "linear-gradient(135deg,#2563eb,#1e40af)" : "#f8fafc";
  const textColor = highlight || primary ? "white" : "#0f172a";
  return (
    <div className="rounded-xl p-4 border" style={{ background: bg, borderColor: highlight || primary ? "transparent" : "#e2e8f0" }}>
      <div className="text-[11px] font-bold tracking-wider opacity-90" style={{ color: textColor }}>{label.toUpperCase()}</div>
      <div className={small ? "text-lg font-bold mt-1" : "text-2xl font-bold mt-1"} style={{ color: textColor }}>{fmtMoney(value)}</div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// COMP TOOL — defaults: 1mi radius, ±25% sqft, 6 months, exclude distressed
// ----------------------------------------------------------------------------
function CompToolModal({ lead, onClose, onUseArv }) {
  const subject = useMemo(() => (lead ? inferSubject(lead) : null), [lead?.id]);
  const compPool = useMemo(() => (lead && subject ? generateCompsForSubject(lead, subject) : []), [lead?.id, subject]);

  const [maxDistance, setMaxDistance] = useState(1.0);
  const [sqftPct, setSqftPct] = useState(25);
  const [monthsBack, setMonthsBack] = useState(6);
  const [excludeDistressed, setExcludeDistressed] = useState(true);
  const [subjectSqft, setSubjectSqft] = useState(subject?.livingArea || 1000);
  // Comp sort: clickable column headers. Default to distance ascending (closest first).
  const [sortField, setSortField] = useState("dist");
  const [sortDir, setSortDir] = useState("asc");
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  useEffect(() => {
    if (subject) setSubjectSqft(subject.livingArea);
  }, [subject?.livingArea]);

  if (!lead || !subject) return null;

  const sqftMin = Math.round(subjectSqft * (1 - sqftPct / 100));
  const sqftMax = Math.round(subjectSqft * (1 + sqftPct / 100));
  const sinceDate = new Date("2026-05-07");
  sinceDate.setDate(sinceDate.getDate() - monthsBack * 30);
  const sinceDateStr = sinceDate.toISOString().slice(0, 10);

  // Hard match: same folio prefix (municipality) AND same zip
  const jurisdictionMatched = compPool.filter(
    (c) => folioPrefix(c.ParcelNumber) === subject.folioPrefix && c.PostalCode === subject.zipCode
  );
  const droppedByJurisdiction = compPool.length - jurisdictionMatched.length;

  const filteredComps = filterComps(compPool, {
    maxDistance, sqftMin, sqftMax, sinceDate: sinceDateStr, excludeDistressed,
    requirePrefix: subject.folioPrefix,
    requireZip: subject.zipCode,
  }).sort((a, b) => {
    // Sort by user-selected column. String fields use localeCompare; numeric fields subtract.
    const dir = sortDir === "asc" ? 1 : -1;
    let av, bv;
    switch (sortField) {
      case "mls":     av = a.ListingId;        bv = b.ListingId;        return av.localeCompare(bv) * dir;
      case "address": av = a.StreetAddress;    bv = b.StreetAddress;    return av.localeCompare(bv) * dir;
      case "sold":    av = a.CloseDate;        bv = b.CloseDate;        return av.localeCompare(bv) * dir;
      case "price":   av = a.ClosePrice;       bv = b.ClosePrice;       return (av - bv) * dir;
      case "sqft":    av = a.LivingArea;       bv = b.LivingArea;       return (av - bv) * dir;
      case "ppsf":    av = a._ppsf;            bv = b._ppsf;            return (av - bv) * dir;
      case "bdba":    av = a.BedroomsTotal * 100 + a.BathroomsTotalInteger;
                      bv = b.BedroomsTotal * 100 + b.BathroomsTotalInteger;
                      return (av - bv) * dir;
      case "financing": av = a.BuyerFinancing; bv = b.BuyerFinancing;   return av.localeCompare(bv) * dir;
      case "sale":    av = a.SaleType;         bv = b.SaleType;         return av.localeCompare(bv) * dir;
      case "dist":
      default:        av = a._distanceMiles;   bv = b._distanceMiles;   return (av - bv) * dir;
    }
  });

  const ppsfList = filteredComps.map((c) => c._ppsf);
  const medianPpsf = median(ppsfList);
  const lowPpsf = percentile(ppsfList, 25);
  const highPpsf = percentile(ppsfList, 75);
  const arvMedian = Math.round((medianPpsf * subjectSqft) / 1000) * 1000;
  const arvLow = Math.round((lowPpsf * subjectSqft) / 1000) * 1000;
  const arvHigh = Math.round((highPpsf * subjectSqft) / 1000) * 1000;
  const usable = filteredComps.length >= 3;

  // AS-IS RANGE: lowest end of cash sales. These are what investors / wholesalers
  // / flippers actually pay for properties in similar (often as-is) condition.
  // Pulled from the jurisdiction-matched pool, ignoring the "exclude distressed"
  // toggle — distressed is part of the as-is universe and should be included here.
  const asIsPool = filterComps(compPool, {
    maxDistance, sqftMin, sqftMax, sinceDate: sinceDateStr, excludeDistressed: false,
    requirePrefix: subject.folioPrefix, requireZip: subject.zipCode,
  }).filter((c) => c.BuyerFinancing === "Cash");
  const asIsPpsfList = asIsPool.map((c) => c._ppsf);
  const asIsLowPpsf = percentile(asIsPpsfList, 10);
  const asIsHighPpsf = percentile(asIsPpsfList, 35);
  const asIsLow = Math.round((asIsLowPpsf * subjectSqft) / 1000) * 1000;
  const asIsHigh = Math.round((asIsHighPpsf * subjectSqft) / 1000) * 1000;
  const asIsUsable = asIsPool.length >= 3;

  // ARV RANGE: top end of FHA / Conventional / VA financed arms-length sales.
  // These are owner-occupants who only close on properties in lendable, livable
  // condition (FHA in particular has appraisal standards). This is your retail
  // exit ceiling — what the property could sell for after rehab.
  const retailPool = filterComps(compPool, {
    maxDistance, sqftMin, sqftMax, sinceDate: sinceDateStr, excludeDistressed: true,
    requirePrefix: subject.folioPrefix, requireZip: subject.zipCode,
  }).filter((c) => ["Conventional", "FHA", "VA"].includes(c.BuyerFinancing));
  const retailPpsfList = retailPool.map((c) => c._ppsf);
  const retailLowPpsf = percentile(retailPpsfList, 65);
  const retailHighPpsf = percentile(retailPpsfList, 90);
  const retailLow = Math.round((retailLowPpsf * subjectSqft) / 1000) * 1000;
  const retailHigh = Math.round((retailHighPpsf * subjectSqft) / 1000) * 1000;
  const retailUsable = retailPool.length >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "#e2e8f0" }}>
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6" style={{ color: "#16a34a" }} />
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>Comp Analysis</h2>
              <div className="text-sm" style={{ color: "#64748b" }}>{lead.propertyAddress} · {lead.propertyCity}</div>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#64748b" }} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* SUBJECT INFO + JURISDICTION MATCH KEY */}
          <div className="rounded-xl p-4 border" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-bold tracking-wider" style={{ color: "#64748b" }}>SUBJECT PROPERTY</div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: "#dbeafe", color: "#1e40af" }}>
                <span className="font-mono">Folio {subject.folioPrefix}-xxxx</span>
                <span style={{ color: "#93c5fd" }}>·</span>
                <span>ZIP {subject.zipCode}</span>
                <span style={{ color: "#93c5fd" }}>·</span>
                <span>{subject.municipality}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div><span className="text-xs" style={{ color: "#64748b" }}>Type</span><div className="font-bold" style={{ color: "#0f172a" }}>{subject.propertySubType}</div></div>
              <div><span className="text-xs" style={{ color: "#64748b" }}>Beds / Baths</span><div className="font-bold" style={{ color: "#0f172a" }}>{subject.bedrooms} / {subject.bathrooms}</div></div>
              <div><span className="text-xs" style={{ color: "#64748b" }}>Year Built</span><div className="font-bold" style={{ color: "#0f172a" }}>{subject.yearBuilt}</div></div>
              <div><span className="text-xs" style={{ color: "#64748b" }}>Folio</span><div className="font-bold text-xs" style={{ color: "#0f172a" }}>{lead.folio}</div></div>
            </div>
            {droppedByJurisdiction > 0 && (
              <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs" style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
                <Info className="w-3.5 h-3.5" />
                <span><strong>{droppedByJurisdiction}</strong> nearby comp{droppedByJurisdiction === 1 ? "" : "s"} excluded — different folio prefix or zip (different municipality / market)</span>
              </div>
            )}
          </div>

          {/* FILTERS */}
          <div className="grid grid-cols-4 gap-4">
            <FilterControl label="Subject SqFt" value={subjectSqft} onChange={setSubjectSqft} suffix="sqft" />
            <FilterControl label="Radius" value={maxDistance} onChange={setMaxDistance} suffix="mi" step={0.25} />
            <FilterControl label="SqFt Variance" value={sqftPct} onChange={setSqftPct} suffix="%" step={5} />
            <FilterControl label="Sold Within" value={monthsBack} onChange={setMonthsBack} suffix="mo" step={1} />
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={excludeDistressed} onChange={(e) => setExcludeDistressed(e.target.checked)} className="w-4 h-4" />
              <span style={{ color: "#475569" }}>Exclude REO / Short Sale (recommended for ARV)</span>
            </label>
            <span className="ml-auto text-xs" style={{ color: "#64748b" }}>
              Filter window: <strong>{sqftMin.toLocaleString()}–{sqftMax.toLocaleString()} sqft</strong>, ≤<strong>{maxDistance} mi</strong>, since <strong>{sinceDateStr}</strong>
            </span>
          </div>

          {/* HEADLINE ARV (median, used by Calculator) */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl p-4 col-span-2" style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}>
              <div className="text-[11px] font-bold tracking-wider opacity-90 text-white">ARV ESTIMATE (MEDIAN)</div>
              <div className="text-3xl font-bold mt-1 text-white">{usable ? fmtMoney(arvMedian) : "—"}</div>
              <div className="text-xs mt-1.5 opacity-90 text-white">
                {usable ? `IQR: ${fmtMoney(arvLow)} – ${fmtMoney(arvHigh)} · ${filteredComps.length} comps · $${Math.round(medianPpsf || 0)}/sqft` : "Need at least 3 comps — widen filters"}
              </div>
            </div>
            <div className="rounded-xl p-4 border" style={{ borderColor: "#e2e8f0", background: "#fef3c7" }}>
              <div className="text-[11px] font-bold tracking-wider" style={{ color: "#854d0e" }}>FILTERED COMPS</div>
              <div className="text-2xl font-bold mt-1" style={{ color: "#854d0e" }}>{filteredComps.length}</div>
              <div className="text-xs mt-0.5" style={{ color: "#854d0e" }}>of {jurisdictionMatched.length} matched pool</div>
            </div>
            <div className="rounded-xl p-4 border" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
              <div className="text-[11px] font-bold tracking-wider" style={{ color: "#475569" }}>SUBJECT $/SQFT</div>
              <div className="text-2xl font-bold mt-1" style={{ color: "#0f172a" }}>${Math.round(medianPpsf || 0)}</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>median of comps</div>
            </div>
          </div>

          {/* AS-IS RANGE + ARV RANGE (the two-sided defense) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4 border" style={{ borderColor: "#475569", background: "linear-gradient(135deg,#334155,#1e293b)" }}>
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold tracking-wider opacity-90 text-white">AS-IS RANGE</div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>CASH BUYERS</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-white">
                {asIsUsable ? `${fmtMoney(asIsLow)} – ${fmtMoney(asIsHigh)}` : "—"}
              </div>
              <div className="text-xs mt-1.5 opacity-80 text-white">
                {asIsUsable
                  ? `${asIsPool.length} cash sales · 10th–35th %ile · $${Math.round(asIsLowPpsf)}–$${Math.round(asIsHighPpsf)}/sqft`
                  : "Need 3+ cash comps — widen filters"}
              </div>
              <div className="text-[11px] mt-2 pt-2 border-t opacity-80 text-white" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
                What investors actually pay for as-is property. Use this to defend your <strong>wholesale offer to the seller</strong>.
              </div>
            </div>
            <div className="rounded-xl p-4 border" style={{ borderColor: "#0e7490", background: "linear-gradient(135deg,#0891b2,#0e7490)" }}>
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold tracking-wider opacity-90 text-white">ARV RANGE</div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>FHA / CONV / VA</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-white">
                {retailUsable ? `${fmtMoney(retailLow)} – ${fmtMoney(retailHigh)}` : "—"}
              </div>
              <div className="text-xs mt-1.5 opacity-90 text-white">
                {retailUsable
                  ? `${retailPool.length} financed sales · 65th–90th %ile · $${Math.round(retailLowPpsf)}–$${Math.round(retailHighPpsf)}/sqft`
                  : "Need 3+ financed comps — widen filters"}
              </div>
              <div className="text-[11px] mt-2 pt-2 border-t opacity-90 text-white" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
                What financed retail buyers pay post-rehab. Use this for your <strong>fix-and-flip exit ceiling</strong>.
              </div>
            </div>
          </div>

          {/* COMP TABLE */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#f8fafc", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                    {(() => {
                      // Reusable sortable header. Shows ↑/↓ arrow when active, faint ↕ when inactive.
                      const SortHeader = ({ field, label, align }) => {
                        const active = sortField === field;
                        const arrow = active ? (sortDir === "asc" ? "↑" : "↓") : "↕";
                        const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
                        const justifyClass = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
                        return (
                          <th className={`${alignClass} px-3 py-2.5 text-[10px] font-bold tracking-wider`}>
                            <button
                              onClick={() => handleSort(field)}
                              className={`inline-flex items-center gap-1 ${justifyClass} hover:underline`}
                              style={{ color: active ? "#1e40af" : "#64748b" }}
                            >
                              <span>{label}</span>
                              <span className="text-[9px]" style={{ opacity: active ? 1 : 0.4 }}>{arrow}</span>
                            </button>
                          </th>
                        );
                      };
                      return (
                        <>
                          <SortHeader field="mls" label="MLS#" align="left" />
                          <SortHeader field="address" label="ADDRESS" align="left" />
                          <SortHeader field="sold" label="SOLD" align="left" />
                          <SortHeader field="price" label="PRICE" align="right" />
                          <SortHeader field="sqft" label="SQFT" align="right" />
                          <SortHeader field="ppsf" label="$/SQFT" align="right" />
                          <SortHeader field="bdba" label="BD/BA" align="center" />
                          <SortHeader field="dist" label="DIST" align="right" />
                          <SortHeader field="financing" label="FINANCING" align="left" />
                          <SortHeader field="sale" label="SALE" align="left" />
                        </>
                      );
                    })()}
                  </tr>
                </thead>
                <tbody>
                  {filteredComps.map((c) => (
                    <tr key={c.ListingId} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td className="px-3 py-2.5 text-[11px] font-mono" style={{ color: "#64748b" }}>{c.ListingId}</td>
                      <td className="px-3 py-2.5 font-medium text-[12px]" style={{ color: "#0f172a" }}>{c.StreetAddress}</td>
                      <td className="px-3 py-2.5 text-[11px]" style={{ color: "#64748b" }}>{c.CloseDate}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-[12px]" style={{ color: "#0f172a" }}>{fmtMoney(c.ClosePrice)}</td>
                      <td className="px-3 py-2.5 text-right text-[11px]" style={{ color: "#475569" }}>{c.LivingArea.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right text-[11px] font-bold" style={{ color: "#0f172a" }}>${Math.round(c._ppsf)}</td>
                      <td className="px-3 py-2.5 text-center text-[11px]" style={{ color: "#475569" }}>{c.BedroomsTotal}/{c.BathroomsTotalInteger}</td>
                      <td className="px-3 py-2.5 text-right text-[11px]" style={{ color: "#64748b" }}>{c._distanceMiles.toFixed(2)}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{
                          background: c.BuyerFinancing === "Cash" ? "#e2e8f0" :
                                      c.BuyerFinancing === "FHA"  ? "#cffafe" :
                                      c.BuyerFinancing === "VA"   ? "#dbeafe" :
                                                                    "#dcfce7",
                          color: c.BuyerFinancing === "Cash" ? "#334155" :
                                 c.BuyerFinancing === "FHA"  ? "#155e75" :
                                 c.BuyerFinancing === "VA"   ? "#1e40af" :
                                                               "#166534",
                        }}>{c.BuyerFinancing === "Conventional" ? "CONV" : c.BuyerFinancing.toUpperCase()}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{
                          background: c.SaleType === "ArmsLength" ? "#dcfce7" : c.SaleType === "REO" ? "#fee2e2" : "#fef3c7",
                          color: c.SaleType === "ArmsLength" ? "#166534" : c.SaleType === "REO" ? "#991b1b" : "#854d0e",
                        }}>{c.SaleType === "ArmsLength" ? "ARM" : c.SaleType === "REO" ? "REO" : "SHORT"}</span>
                      </td>
                    </tr>
                  ))}
                  {filteredComps.length === 0 && (
                    <tr><td colSpan={10} className="text-center py-10" style={{ color: "#94a3b8" }}>
                      No comps match these filters — try widening the radius or sqft variance
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg p-3 flex items-start gap-3" style={{ background: "#eff6ff", color: "#1e40af" }}>
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="text-xs leading-relaxed">
              <strong>Live data source:</strong> Once your MIAMI MLS RESO Web API credentials are wired in, this exact UI hits{" "}
              <code className="px-1 rounded font-mono" style={{ background: "#dbeafe" }}>GET /Property?$filter=StandardStatus eq 'Closed' and CloseDate ge {sinceDateStr}...</code>{" "}
              with the filter values above. Field names below match the RESO Data Dictionary so the swap is a no-op. Comps shown are realistic mock data.
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex items-center gap-3" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
          <button
            onClick={() => onUseArv && onUseArv(arvMedian)}
            disabled={!usable}
            title="Use median ARV — balanced estimate from all filtered comps"
            className="flex-1 px-4 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: usable ? "linear-gradient(135deg,#16a34a,#15803d)" : "#94a3b8" }}
          >
            <Calculator className="w-4 h-4" /> {usable ? `Use ARV (Median) ${fmtMoney(arvMedian)}` : "Need 3+ comps"}
          </button>
          <button
            onClick={() => onUseArv && onUseArv(retailHigh)}
            disabled={!retailUsable}
            title="Use top of ARV Range — what financed buyers pay at retail"
            className="flex-1 px-4 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: retailUsable ? "linear-gradient(135deg,#0891b2,#0e7490)" : "#94a3b8" }}
          >
            <Calculator className="w-4 h-4" /> {retailUsable ? `Use ARV (Retail Top) ${fmtMoney(retailHigh)}` : "Need 3+ FHA/Conv"}
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl bg-white border font-semibold" style={{ borderColor: "#e2e8f0", color: "#334155" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterControl({ label, value, onChange, suffix, step = 1 }) {
  return (
    <div>
      <label className="text-[11px] font-bold tracking-wider mb-1.5 block" style={{ color: "#64748b" }}>{label.toUpperCase()}</label>
      <div className="flex items-center rounded-lg border" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
        <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 px-2 py-2 bg-transparent outline-none text-sm font-medium min-w-0 w-full" />
        {suffix && <span className="pr-3 text-xs" style={{ color: "#64748b" }}>{suffix}</span>}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// IMPORT INFO MODAL
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ALERTS INBOX MODAL
// ----------------------------------------------------------------------------
function AlertsInboxModal({ alerts, leads, onClose, onMarkRead, onMarkAllRead, onOpenLead, onOpenSettings }) {
  const [filter, setFilter] = useState("all"); // all | unread | high
  const leadById = useMemo(() => Object.fromEntries(leads.map((l) => [l.id, l])), [leads]);

  const filtered = alerts.filter((a) => {
    if (filter === "unread") return !a.read;
    if (filter === "high") return ALERT_TYPES[a.type]?.priority === "high";
    return true;
  });

  const formatRelative = (iso) => {
    const now = new Date("2026-05-07T15:00:00Z");
    const then = new Date(iso);
    const ms = now - then;
    const mins = Math.floor(ms / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ago`;
    if (hrs > 0)  return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "just now";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" style={{ background: "rgba(15,23,42,0.5)" }} onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="p-5 border-b" style={{ borderColor: "#e2e8f0" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" style={{ color: "#0f172a" }} />
              <h2 className="text-lg font-bold" style={{ color: "#0f172a" }}>Alerts</h2>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#f1f5f9", color: "#475569" }}>{alerts.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={onOpenSettings} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100" title="Alert settings">
                <Settings className="w-4 h-4" style={{ color: "#64748b" }} />
              </button>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
                <X className="w-4 h-4" style={{ color: "#64748b" }} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FilterPill label="All" count={alerts.length} active={filter === "all"} onClick={() => setFilter("all")} />
            <FilterPill label="Unread" count={alerts.filter((a) => !a.read).length} active={filter === "unread"} onClick={() => setFilter("unread")} />
            <FilterPill label="High Priority" count={alerts.filter((a) => ALERT_TYPES[a.type]?.priority === "high").length} active={filter === "high"} onClick={() => setFilter("high")} />
            <button onClick={onMarkAllRead} className="ml-auto text-xs flex items-center gap-1 hover:underline" style={{ color: "#2563eb" }}>
              <CheckCheck className="w-3 h-3" /> Mark all read
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="p-12 text-center" style={{ color: "#94a3b8" }}>
              <BellOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <div className="text-sm">No alerts match this filter</div>
            </div>
          )}
          {filtered.map((alert) => {
            const cfg = ALERT_TYPES[alert.type];
            const lead = leadById[alert.leadId];
            if (!cfg || !lead) return null;
            return (
              <button
                key={alert.id}
                onClick={() => { onMarkRead(alert.id); onOpenLead(alert.leadId); }}
                className="w-full text-left px-5 py-4 border-b hover:bg-slate-50 transition flex gap-3"
                style={{ borderColor: "#f1f5f9", background: alert.read ? "white" : "#f0f9ff" }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}15` }}>
                  <AlertIcon iconName={cfg.icon} color={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.label}</span>
                    {!alert.read && <span className="w-2 h-2 rounded-full" style={{ background: "#2563eb" }}></span>}
                    {cfg.priority === "high" && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#fee2e2", color: "#991b1b" }}>HIGH</span>}
                    <span className="ml-auto text-[11px]" style={{ color: "#94a3b8" }}>{formatRelative(alert.at)}</span>
                  </div>
                  <div className="font-medium text-[13px] truncate" style={{ color: "#0f172a" }}>{lead.propertyAddress}</div>
                  <div className="text-xs" style={{ color: "#64748b" }}>{lead.propertyCity} · Folio {lead.folio}</div>
                  {alert.type === "outreach_unlocked" && (
                    <div className="text-[11px] mt-1" style={{ color: "#15803d" }}>
                      {alert.payload.from} → {alert.payload.to} · was listed at {fmtMoney(alert.payload.listPriceWasAt)} for {alert.payload.daysOnMarket} days
                    </div>
                  )}
                  {alert.type === "came_back_to_market" && (
                    <div className="text-[11px] mt-1" style={{ color: "#c2410c" }}>
                      Pending → Active · listed at {fmtMoney(alert.payload.listPrice)}
                    </div>
                  )}
                  {alert.type === "score_threshold_crossed" && (
                    <div className="text-[11px] mt-1" style={{ color: "#dc2626" }}>
                      Score: {alert.payload.from} → {alert.payload.to}
                    </div>
                  )}
                  {alert.type === "new_lis_pendens" && (
                    <div className="text-[11px] mt-1" style={{ color: "#dc2626" }}>
                      Filed {fmtMoney(alert.payload.amount)} · 7-day window for highest conversion
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t text-[11px] text-center" style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#94a3b8" }}>
          Alerts run after every ingestion cycle · click Settings to configure delivery
        </div>
      </div>
    </div>
  );
}

function FilterPill({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-full text-xs font-medium transition flex items-center gap-1"
      style={{
        background: active ? "#2563eb" : "#f1f5f9",
        color: active ? "white" : "#475569",
      }}
    >
      {label} <span className="opacity-75">{count}</span>
    </button>
  );
}

function AlertIcon({ iconName, color }) {
  const icons = { Bell, TrendingUp, Scale, Gavel, AlertCircle, FileText, Flame };
  const Icon = icons[iconName] || Bell;
  return <Icon className="w-4 h-4" style={{ color }} />;
}

// ----------------------------------------------------------------------------
// ALERT SETTINGS MODAL — per-alert-type routing + quiet hours
// ----------------------------------------------------------------------------
function AlertSettingsModal({ prefs, onChangePrefs, quietHours, onChangeQuietHours, onClose, onOpenGhl }) {
  const channels = [
    { key: "inApp", label: "In-App", icon: Bell, alwaysOn: true },
    { key: "ghl",   label: "GHL Workflow", icon: TrendingUp },
    { key: "slack", label: "Slack", icon: Slack },
    { key: "email", label: "Email", icon: Mail },
    { key: "sms",   label: "SMS", icon: MessageSquare },
  ];
  const togglePref = (alertType, channel) => {
    onChangePrefs({
      ...prefs,
      [alertType]: { ...prefs[alertType], [channel]: !prefs[alertType][channel] },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "#e2e8f0" }}>
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" style={{ color: "#2563eb" }} />
            <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>Alert Settings</h2>
          </div>
          <div className="flex items-center gap-2">
            {onOpenGhl && (
              <button onClick={onOpenGhl} className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 transition" style={{ background: "#dbeafe", color: "#1e40af" }}>
                <ExternalLink className="w-3 h-3" /> Configure GHL Webhooks
              </button>
            )}
            <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#64748b" }} /></button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* QUIET HOURS */}
          <div className="rounded-xl p-4 border" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-sm" style={{ color: "#0f172a" }}>Quiet Hours</div>
                <div className="text-xs" style={{ color: "#64748b" }}>Suppress Slack / Email / SMS during these hours. In-app and GHL still fire.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={quietHours.enabled} onChange={(e) => onChangeQuietHours({ ...quietHours, enabled: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {quietHours.enabled && (
              <div className="flex items-center gap-3 text-sm">
                <span style={{ color: "#475569" }}>From</span>
                <select value={quietHours.start} onChange={(e) => onChangeQuietHours({ ...quietHours, start: Number(e.target.value) })} className="px-2 py-1 rounded border bg-white text-sm" style={{ borderColor: "#e2e8f0" }}>
                  {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{h.toString().padStart(2, "0")}:00</option>)}
                </select>
                <span style={{ color: "#475569" }}>to</span>
                <select value={quietHours.end} onChange={(e) => onChangeQuietHours({ ...quietHours, end: Number(e.target.value) })} className="px-2 py-1 rounded border bg-white text-sm" style={{ borderColor: "#e2e8f0" }}>
                  {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{h.toString().padStart(2, "0")}:00</option>)}
                </select>
              </div>
            )}
          </div>

          {/* PER-ALERT ROUTING TABLE */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th className="text-left px-4 py-3 text-[11px] font-bold tracking-wider" style={{ color: "#64748b" }}>ALERT TYPE</th>
                  {channels.map((c) => (
                    <th key={c.key} className="text-center px-3 py-3 text-[11px] font-bold tracking-wider" style={{ color: "#64748b" }}>
                      <div className="flex flex-col items-center gap-1">
                        <c.icon className="w-3.5 h-3.5" />
                        <span>{c.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(ALERT_TYPES).map(([alertType, cfg]) => (
                  <tr key={alertType} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}15` }}>
                          <AlertIcon iconName={cfg.icon} color={cfg.color} />
                        </div>
                        <div>
                          <div className="font-bold text-[13px]" style={{ color: "#0f172a" }}>{cfg.label}</div>
                          <div className="text-[11px]" style={{ color: "#64748b" }}>{cfg.description}</div>
                        </div>
                      </div>
                    </td>
                    {channels.map((c) => (
                      <td key={c.key} className="text-center px-3 py-3">
                        <input
                          type="checkbox"
                          checked={prefs[alertType]?.[c.key] || false}
                          disabled={c.alwaysOn}
                          onChange={() => togglePref(alertType, c.key)}
                          className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg p-3 flex items-start gap-2 text-xs" style={{ background: "#eff6ff", color: "#1e40af" }}>
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="leading-relaxed">
              <strong>Production wiring:</strong> Each enabled channel becomes a webhook target. GHL alerts POST to a Workflow trigger URL (you provide). Slack uses an Incoming Webhook URL. Email goes through SendGrid/Postmark. SMS goes through Twilio. The dashboard composes the payload; the delivery is plumbing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// GHL SETTINGS MODAL — webhook URL configuration + activity log + payload preview
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// CODE VIOLATIONS API SETTINGS MODAL
// User-configurable endpoint URL + folio field name + live test button.
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// IMPORT MODAL
// Drag-and-drop or file-picker for CSV files. Auto-detects schema based on
// column headers, lets the user override, shows a preview of what will be
// created vs enriched vs skipped, and then commits the import.
// ----------------------------------------------------------------------------
function ImportModal({ existingLeads, codeViolationsApi, onApplyImport, onClose }) {
  const [fileName, setFileName] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [schemaKey, setSchemaKey] = useState(null);
  const [previewResult, setPreviewResult] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(null);
  const [parseError, setParseError] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    setParseError(null);
    setApplied(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = parseCsv(text);
        if (rows.length === 0) {
          setParseError("File parsed but has no data rows. Make sure it has a header row plus at least one data row.");
          setParsedRows([]); setHeaders([]); setSchemaKey(null); setPreviewResult(null);
          return;
        }
        const cols = Object.keys(rows[0]);
        setHeaders(cols);
        setParsedRows(rows);
        const detected = detectImportSchema(cols);
        setSchemaKey(detected);
        if (detected === "ghlContactRefresh") {
          setPreviewResult(processGhlRefresh(rows, existingLeads));
        } else if (detected) {
          setPreviewResult(applyImport(rows, detected, existingLeads, codeViolationsApi));
        } else {
          setPreviewResult(null);
        }
      } catch (err) {
        setParseError(`Could not parse file: ${err.message}`);
      }
    };
    reader.onerror = () => setParseError("Could not read file. Try saving as plain CSV (UTF-8) and re-uploading.");
    reader.readAsText(file);
  };

  const handleSchemaChange = (newKey) => {
    setSchemaKey(newKey);
    if (newKey === "ghlContactRefresh" && parsedRows.length > 0) {
      setPreviewResult(processGhlRefresh(parsedRows, existingLeads));
    } else if (newKey && parsedRows.length > 0) {
      setPreviewResult(applyImport(parsedRows, newKey, existingLeads, codeViolationsApi));
    } else {
      setPreviewResult(null);
    }
  };

  const handleApply = () => {
    if (!previewResult) return;
    setApplying(true);
    // GHL refresh path: download the CSV, mark matched leads as inCrm=true,
    // and report stats so the success panel can show what happened.
    if (schemaKey === "ghlContactRefresh") {
      if (previewResult.reportRows && previewResult.reportRows.length > 0) {
        const today = new Date().toISOString().slice(0, 10);
        downloadCsv(previewResult.reportRows, `ghl-update-${today}.csv`);
      }
      onApplyImport({
        ghlRefresh: true,
        matchedLeadIds: previewResult.matchedLeadIds || [],
      });
      setTimeout(() => {
        setApplying(false);
        setApplied({ ...previewResult.stats, _ghlRefresh: true });
      }, 300);
      return;
    }
    // Standard enrich/insert path
    onApplyImport({
      updates: previewResult.updates || [],
      inserts: previewResult.inserts || [],
    });
    setTimeout(() => {
      setApplying(false);
      setApplied(previewResult.stats);
    }, 300);
  };

  const handleReset = () => {
    setFileName(null);
    setParsedRows([]);
    setHeaders([]);
    setSchemaKey(null);
    setPreviewResult(null);
    setApplied(null);
    setParseError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b" style={{ borderColor: "#e2e8f0" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>Import Leads from CSV</h2>
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>Upload exports from County Reports, RealForeclose, MIAMI MLS Matrix, or your GHL contact list. The first three enrich existing leads; GHL contact refresh produces a CSV to push current MLS / sold status back to your CRM.</p>
            </div>
            <button onClick={onClose} className="text-2xl" style={{ color: "#64748b" }}>×</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {!fileName && (
            <div
              className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition"
              style={{ borderColor: "#cbd5e1", background: "#f8fafc" }}
              onClick={() => document.getElementById("csv-file-input")?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.borderColor = "#1e40af"; }}
              onDragLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.borderColor = "#cbd5e1";
                handleFile(e.dataTransfer.files?.[0]);
              }}
            >
              <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: "#64748b" }} />
              <div className="font-bold mb-1" style={{ color: "#0f172a" }}>Drop a CSV file here, or click to browse</div>
              <div className="text-xs" style={{ color: "#64748b" }}>Supported: County Reports, RealForeclose, MIAMI MLS Matrix, GHL contact export</div>
              <input
                type="file"
                id="csv-file-input"
                accept=".csv,text/csv"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          )}

          {parseError && (
            <div className="rounded-lg p-3 text-sm" style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }}>
              <strong>Parse error:</strong> {parseError}
            </div>
          )}

          {fileName && parsedRows.length > 0 && !applied && (
            <>
              <div className="flex items-center justify-between rounded-lg p-3" style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}>
                <div>
                  <div className="font-bold text-sm" style={{ color: "#15803d" }}>✓ {fileName}</div>
                  <div className="text-xs" style={{ color: "#15803d" }}>{parsedRows.length} rows · {headers.length} columns</div>
                </div>
                <button onClick={handleReset} className="text-xs font-bold px-3 py-1.5 rounded" style={{ background: "white", color: "#475569", border: "1px solid #cbd5e1" }}>
                  Choose Different File
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-wider mb-1.5 block" style={{ color: "#64748b" }}>SOURCE TYPE</label>
                <div className="flex gap-2">
                  {Object.entries(IMPORT_SCHEMAS).map(([key, schema]) => (
                    <button
                      key={key}
                      onClick={() => handleSchemaChange(key)}
                      className="flex-1 px-3 py-2.5 rounded-lg border text-left transition"
                      style={{
                        background: schemaKey === key ? "#dbeafe" : "white",
                        borderColor: schemaKey === key ? "#1e40af" : "#cbd5e1",
                      }}
                    >
                      <div className="text-xs font-bold" style={{ color: schemaKey === key ? "#1e40af" : "#0f172a" }}>
                        {schema.label}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>{schema.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {!schemaKey && (
                <div className="rounded-lg p-3 text-xs" style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
                  Couldn't auto-detect the source type from the columns. Pick one above.
                </div>
              )}

              {schemaKey && previewResult && schemaKey === "ghlContactRefresh" && (
                <>
                  <div className="rounded-lg p-2.5 text-[11px]" style={{ background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>
                    <strong>GHL Contact Refresh:</strong> CRM contacts get matched against the pipeline by folio.
                    Clicking Apply downloads a CSV you re-import into GHL to push current MLS / sold status back.
                    Matched leads are also marked <code>inCrm=true</code> in the dashboard so the NOT IN CRM stat card stays accurate.
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg p-3" style={{ background: "#dbeafe", border: "1px solid #bfdbfe" }}>
                      <div className="text-[10px] font-bold tracking-wider" style={{ color: "#1e40af" }}>MATCHED</div>
                      <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#1e40af" }}>{previewResult.stats.matched}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "#1e40af" }}>in pipeline by folio</div>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
                      <div className="text-[10px] font-bold tracking-wider" style={{ color: "#92400e" }}>UNMATCHED</div>
                      <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#92400e" }}>{previewResult.stats.unmatched}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "#92400e" }}>missing folio or not in pipeline</div>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}>
                      <div className="text-[10px] font-bold tracking-wider" style={{ color: "#15803d" }}>CSV ROWS</div>
                      <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#15803d" }}>{(previewResult.reportRows || []).length}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "#15803d" }}>ready for GHL re-import</div>
                    </div>
                  </div>

                  {previewResult.stats.matched > 0 && (() => {
                    // Per-action breakdown — drives the user's understanding of
                    // WHAT they're about to push back to GHL. Each row maps to a
                    // distinct CRM action that GHL workflows can act on.
                    const actions = [
                      { key: "nowSold",        label: "Recently Sold",        rec: "close opportunity",                                color: "#475569" },
                      { key: "nowActive",      label: "Now MLS Active",       rec: "don't call · listing agent owns the relationship", color: "#2563eb" },
                      { key: "nowPending",     label: "Now Pending",          rec: "monitor for fall-through",                         color: "#7c3aed" },
                      { key: "nowExpired",     label: "Now Expired",          rec: "outreach unlocked · escalate to call queue",       color: "#dc2626" },
                      { key: "nowCanceled",    label: "Now Canceled",         rec: "outreach unlocked · escalate to call queue",       color: "#dc2626" },
                      { key: "nowCameBack",    label: "Now Came Back",        rec: "pending fell through · still under listing agt",   color: "#f97316" },
                      { key: "stillOffMarket", label: "Still Off-Market",     rec: "no change · continue working the lead",            color: "#64748b" },
                    ];
                    return (
                      <div className="rounded-lg p-3 space-y-1.5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div className="text-[10px] font-bold tracking-wider mb-1.5" style={{ color: "#64748b" }}>BREAKDOWN — WHAT GHL WILL LEARN</div>
                        {actions.filter((a) => previewResult.stats.byAction[a.key] > 0).map((a) => (
                          <div key={a.key} className="flex items-center gap-3 text-xs">
                            <div className="w-12 text-right font-mono font-bold" style={{ color: a.color }}>{previewResult.stats.byAction[a.key]}</div>
                            <div className="flex-1 flex items-center gap-2">
                              <div className="font-bold" style={{ color: "#0f172a" }}>{a.label}</div>
                              <div className="text-[10px]" style={{ color: "#64748b" }}>→ {a.rec}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {previewResult.stats.unmatchedReasons && previewResult.stats.unmatchedReasons.length > 0 && (
                    <details className="rounded-lg p-2.5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <summary className="text-xs font-bold cursor-pointer" style={{ color: "#475569" }}>
                        Review {previewResult.stats.unmatched} unmatched contact{previewResult.stats.unmatched === 1 ? "" : "s"}
                      </summary>
                      <div className="text-[11px] mt-2 space-y-0.5 max-h-48 overflow-y-auto font-mono" style={{ color: "#64748b" }}>
                        {previewResult.stats.unmatchedReasons.slice(0, 50).map((r, i) => <div key={i}>• {r}</div>)}
                        {previewResult.stats.unmatchedReasons.length > 50 && <div>+ {previewResult.stats.unmatchedReasons.length - 50} more</div>}
                      </div>
                    </details>
                  )}
                </>
              )}

              {schemaKey && previewResult && schemaKey !== "ghlContactRefresh" && (
                <>
                  {schemaKey === "ghlContactRefresh" ? (
                    <div className="rounded-lg p-2.5 text-[11px]" style={{ background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>
                      <strong>CRM Refresh mode (reverse flow):</strong> matches your GHL contacts by folio, then generates an update CSV with current dashboard knowledge (MLS status, sold info, listing agent, DOM, Do Not Call flag, suggested tags). Re-import that CSV into GHL to bring stale contacts up to date. Matched leads also get marked as <strong>In CRM</strong> in this dashboard.
                    </div>
                  ) : schemaKey === "mlsExport" ? (
                    <div className="rounded-lg p-2.5 text-[11px]" style={{ background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>
                      <strong>MLS broad import:</strong> existing leads get their MLS Status, list price, DOM, and (for Closed) sold price updated. Listings that don't match any pipeline lead are inserted as <strong>Comp Source</strong> records — invisible in the main table but available to the Comp Tool when pulling neighborhood comps.
                    </div>
                  ) : (
                    <div className="rounded-lg p-2.5 text-[11px]" style={{ background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>
                      <strong>Enrich-only mode:</strong> only properties already in your pipeline get updated. Rows for properties not yet tracked are skipped (you can review them below).
                    </div>
                  )}
                  {schemaKey === "ghlContactRefresh" ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg p-3" style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}>
                          <div className="text-[10px] font-bold tracking-wider" style={{ color: "#15803d" }}>MATCHED</div>
                          <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#15803d" }}>{previewResult.stats.matched}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: "#15803d" }}>contacts ready to update in GHL</div>
                        </div>
                        <div className="rounded-lg p-3" style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
                          <div className="text-[10px] font-bold tracking-wider" style={{ color: "#92400e" }}>UNMATCHED</div>
                          <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#92400e" }}>{previewResult.stats.unmatched}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: "#92400e" }}>missing folio or not in pipeline</div>
                        </div>
                      </div>
                      {previewResult.stats.matched > 0 && (
                        <div className="rounded-lg p-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <div className="text-[10px] font-bold tracking-wider mb-2" style={{ color: "#475569" }}>WHAT THIS WILL DO PER CONTACT</div>
                          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                            {previewResult.stats.byAction.nowSold > 0 && (
                              <div className="flex items-center justify-between rounded px-2 py-1" style={{ background: "#dcfce7", color: "#15803d" }}>
                                <span>✓ Recently sold — close in CRM</span>
                                <span className="font-mono font-bold">{previewResult.stats.byAction.nowSold}</span>
                              </div>
                            )}
                            {previewResult.stats.byAction.nowActive > 0 && (
                              <div className="flex items-center justify-between rounded px-2 py-1" style={{ background: "#fee2e2", color: "#991b1b" }}>
                                <span>⚠ Active on MLS — don't call</span>
                                <span className="font-mono font-bold">{previewResult.stats.byAction.nowActive}</span>
                              </div>
                            )}
                            {previewResult.stats.byAction.nowPending > 0 && (
                              <div className="flex items-center justify-between rounded px-2 py-1" style={{ background: "#ede9fe", color: "#5b21b6" }}>
                                <span>⚠ Pending — monitor</span>
                                <span className="font-mono font-bold">{previewResult.stats.byAction.nowPending}</span>
                              </div>
                            )}
                            {previewResult.stats.byAction.nowExpired > 0 && (
                              <div className="flex items-center justify-between rounded px-2 py-1" style={{ background: "#fef2f2", color: "#dc2626" }}>
                                <span>★ Expired — outreach unlocked</span>
                                <span className="font-mono font-bold">{previewResult.stats.byAction.nowExpired}</span>
                              </div>
                            )}
                            {previewResult.stats.byAction.nowCanceled > 0 && (
                              <div className="flex items-center justify-between rounded px-2 py-1" style={{ background: "#fef2f2", color: "#dc2626" }}>
                                <span>★ Canceled — outreach unlocked</span>
                                <span className="font-mono font-bold">{previewResult.stats.byAction.nowCanceled}</span>
                              </div>
                            )}
                            {previewResult.stats.byAction.nowCameBack > 0 && (
                              <div className="flex items-center justify-between rounded px-2 py-1" style={{ background: "#fff7ed", color: "#c2410c" }}>
                                <span>↻ Came Back — fell through</span>
                                <span className="font-mono font-bold">{previewResult.stats.byAction.nowCameBack}</span>
                              </div>
                            )}
                            {previewResult.stats.byAction.stillOffMarket > 0 && (
                              <div className="flex items-center justify-between rounded px-2 py-1" style={{ background: "#f1f5f9", color: "#475569" }}>
                                <span>· Still off-market — no change</span>
                                <span className="font-mono font-bold">{previewResult.stats.byAction.stillOffMarket}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {previewResult.stats.unmatchedReasons && previewResult.stats.unmatchedReasons.length > 0 && (
                        <details className="rounded-lg p-2.5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <summary className="text-xs font-bold cursor-pointer" style={{ color: "#475569" }}>
                            Review {previewResult.stats.unmatched} unmatched contacts
                          </summary>
                          <div className="text-[11px] mt-2 space-y-0.5 max-h-48 overflow-y-auto font-mono" style={{ color: "#64748b" }}>
                            {previewResult.stats.unmatchedReasons.slice(0, 50).map((r, i) => <div key={i}>• {r}</div>)}
                            {previewResult.stats.unmatchedReasons.length > 50 && <div>+ {previewResult.stats.unmatchedReasons.length - 50} more</div>}
                          </div>
                        </details>
                      )}
                    </>
                  ) : (
                    <>
                      <div className={`grid gap-2 ${schemaKey === "mlsExport" ? "grid-cols-3" : "grid-cols-2"}`}>
                        <div className="rounded-lg p-3" style={{ background: "#dbeafe", border: "1px solid #bfdbfe" }}>
                          <div className="text-[10px] font-bold tracking-wider" style={{ color: "#1e40af" }}>ENRICHED</div>
                          <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#1e40af" }}>{previewResult.stats.enriched}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: "#1e40af" }}>existing leads updated</div>
                        </div>
                        {schemaKey === "mlsExport" && (
                          <div className="rounded-lg p-3" style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}>
                            <div className="text-[10px] font-bold tracking-wider" style={{ color: "#15803d" }}>INSERTED</div>
                            <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#15803d" }}>{previewResult.stats.inserted || 0}</div>
                            <div className="text-[10px] mt-0.5" style={{ color: "#15803d" }}>new Comp Source records</div>
                          </div>
                        )}
                        <div className="rounded-lg p-3" style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
                          <div className="text-[10px] font-bold tracking-wider" style={{ color: "#92400e" }}>SKIPPED</div>
                          <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#92400e" }}>{previewResult.stats.skipped}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: "#92400e" }}>missing/invalid data</div>
                        </div>
                      </div>

                      {previewResult.stats.skippedReasons.length > 0 && (
                        <details className="rounded-lg p-2.5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <summary className="text-xs font-bold cursor-pointer" style={{ color: "#475569" }}>
                            Review {previewResult.stats.skipped} skipped rows
                          </summary>
                          <div className="text-[11px] mt-2 space-y-0.5 max-h-48 overflow-y-auto font-mono" style={{ color: "#64748b" }}>
                            {previewResult.stats.skippedReasons.slice(0, 50).map((r, i) => <div key={i}>• {r}</div>)}
                            {previewResult.stats.skippedReasons.length > 50 && <div>+ {previewResult.stats.skippedReasons.length - 50} more</div>}
                          </div>
                        </details>
                      )}
                    </>
                  )}

                  <details className="rounded-lg p-2.5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <summary className="text-xs font-bold cursor-pointer" style={{ color: "#475569" }}>
                      Preview first 5 rows ({headers.length} columns detected)
                    </summary>
                    <div className="mt-2 overflow-x-auto">
                      <table className="text-[10px] w-full">
                        <thead>
                          <tr>
                            {headers.slice(0, 6).map((h) => (
                              <th key={h} className="text-left p-1 font-bold whitespace-nowrap" style={{ color: "#475569", background: "#e2e8f0" }}>{h}</th>
                            ))}
                            {headers.length > 6 && <th className="text-left p-1" style={{ color: "#94a3b8" }}>+{headers.length - 6} more</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {parsedRows.slice(0, 5).map((r, i) => (
                            <tr key={i} className="border-t" style={{ borderColor: "#e2e8f0" }}>
                              {headers.slice(0, 6).map((h) => (
                                <td key={h} className="p-1 truncate max-w-[120px]" style={{ color: "#0f172a" }}>{r[h]}</td>
                              ))}
                              {headers.length > 6 && <td className="p-1" style={{ color: "#94a3b8" }}>…</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                </>
              )}
            </>
          )}

          {applied && applied._ghlRefresh && (
            <div className="rounded-xl p-6" style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCheck className="w-6 h-6" style={{ color: "#15803d" }} />
                <div className="text-lg font-bold" style={{ color: "#15803d" }}>GHL Refresh Complete</div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="rounded-lg p-3 bg-white">
                  <div className="text-[10px] font-bold tracking-wider" style={{ color: "#1e40af" }}>MATCHED</div>
                  <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#1e40af" }}>{applied.matched}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#1e40af" }}>marked <code>inCrm=true</code></div>
                </div>
                <div className="rounded-lg p-3 bg-white">
                  <div className="text-[10px] font-bold tracking-wider" style={{ color: "#92400e" }}>UNMATCHED</div>
                  <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#92400e" }}>{applied.unmatched}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#92400e" }}>review skipped list</div>
                </div>
                <div className="rounded-lg p-3 bg-white">
                  <div className="text-[10px] font-bold tracking-wider" style={{ color: "#15803d" }}>CSV DOWNLOADED</div>
                  <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#15803d" }}>✓</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#15803d" }}>check your downloads folder</div>
                </div>
              </div>
              <div className="text-xs" style={{ color: "#15803d" }}>
                Next: re-import the CSV into GHL (Contacts → Bulk Import → match on <code>Contact ID</code>).
                The CSV preserves your existing GHL Contact IDs as the match key so no duplicates are created — only existing contacts get updated.
                Close this modal when you're done.
              </div>
            </div>
          )}

          {applied && applied._ghlRefresh && (
            <div className="rounded-xl p-6" style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCheck className="w-6 h-6" style={{ color: "#15803d" }} />
                <div className="text-lg font-bold" style={{ color: "#15803d" }}>Update CSV Downloaded</div>
              </div>
              <div className="grid gap-2 mb-3 grid-cols-2">
                <div className="rounded-lg p-3 bg-white">
                  <div className="text-[10px] font-bold tracking-wider" style={{ color: "#15803d" }}>CONTACTS IN CSV</div>
                  <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#15803d" }}>{applied.matched}</div>
                </div>
                <div className="rounded-lg p-3 bg-white">
                  <div className="text-[10px] font-bold tracking-wider" style={{ color: "#92400e" }}>UNMATCHED</div>
                  <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#92400e" }}>{applied.unmatched}</div>
                </div>
              </div>
              <div className="rounded-lg p-3 bg-white mb-3">
                <div className="text-[10px] font-bold tracking-wider mb-2" style={{ color: "#475569" }}>NEXT STEPS</div>
                <ol className="text-xs space-y-1 list-decimal pl-4" style={{ color: "#0f172a" }}>
                  <li>The update CSV downloaded to your default Downloads folder.</li>
                  <li>In GoHighLevel, open <strong>Contacts → Bulk Actions → Import Contacts</strong>.</li>
                  <li>Upload the CSV. Map <strong>Contact ID</strong> to the GHL contact ID field — this triggers <em>update</em> mode instead of creating new contacts.</li>
                  <li>The remaining columns map to your custom fields (MLS Status, Do Not Call, Tags to Apply, etc.).</li>
                </ol>
              </div>
              <div className="text-xs" style={{ color: "#15803d" }}>
                {applied.matched} matched lead{applied.matched !== 1 ? "s" : ""} marked as In CRM in this dashboard. Close this modal to see updated counts.
              </div>
            </div>
          )}
          {applied && !applied._ghlRefresh && (
            <div className="rounded-xl p-6" style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCheck className="w-6 h-6" style={{ color: "#15803d" }} />
                <div className="text-lg font-bold" style={{ color: "#15803d" }}>Import Complete</div>
              </div>
              <div className={`grid gap-2 mb-3 ${(applied.inserted || 0) > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
                <div className="rounded-lg p-3 bg-white">
                  <div className="text-[10px] font-bold tracking-wider" style={{ color: "#1e40af" }}>ENRICHED</div>
                  <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#1e40af" }}>{applied.enriched}</div>
                </div>
                {(applied.inserted || 0) > 0 && (
                  <div className="rounded-lg p-3 bg-white">
                    <div className="text-[10px] font-bold tracking-wider" style={{ color: "#15803d" }}>INSERTED</div>
                    <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#15803d" }}>{applied.inserted}</div>
                  </div>
                )}
                <div className="rounded-lg p-3 bg-white">
                  <div className="text-[10px] font-bold tracking-wider" style={{ color: "#92400e" }}>SKIPPED</div>
                  <div className="font-mono font-bold text-2xl mt-1" style={{ color: "#92400e" }}>{applied.skipped}</div>
                </div>
              </div>
              <div className="text-xs" style={{ color: "#15803d" }}>
                {applied.enriched > 0 && <>{applied.enriched} existing lead{applied.enriched !== 1 ? "s" : ""} updated. </>}
                {(applied.inserted || 0) > 0 && <>{applied.inserted} new Comp Source record{applied.inserted !== 1 ? "s" : ""} inserted (hidden from main table; available to Comp Tool). </>}
                {applied.enriched === 0 && (applied.inserted || 0) === 0 && <>No matches or inserts. Review the skipped rows above.</>}
                {(applied.enriched > 0 || (applied.inserted || 0) > 0) && <>Close this modal to see results.</>}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-between" style={{ borderColor: "#e2e8f0" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: "#f1f5f9", color: "#475569" }}>
            {applied ? "Done" : "Cancel"}
          </button>
          {previewResult && !applied && (
            <button
              onClick={handleApply}
              disabled={
                applying ||
                (schemaKey === "ghlContactRefresh"
                  ? (previewResult.stats.matched || 0) === 0
                  : (previewResult.stats.enriched === 0 && (previewResult.stats.inserted || 0) === 0))
              }
              className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "#16a34a" }}
            >
              {(() => {
                if (applying) return schemaKey === "ghlContactRefresh" ? "Generating CSV..." : "Applying...";
                if (schemaKey === "ghlContactRefresh") {
                  const matched = previewResult.stats.matched || 0;
                  if (matched === 0) return "No matched contacts";
                  return `Download GHL Update CSV (${matched} row${matched === 1 ? "" : "s"})`;
                }
                const enriched = previewResult.stats.enriched || 0;
                const inserted = previewResult.stats.inserted || 0;
                if (enriched === 0 && inserted === 0) return "Nothing to apply";
                const parts = [];
                if (enriched > 0) parts.push(`Enrich ${enriched}`);
                if (inserted > 0) parts.push(`Insert ${inserted}`);
                return parts.join(" + ");
              })()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeViolationsApiModal({ config, onChange, onClose, onClearCache, onTest, onBatchFetch, totalLeads }) {
  const [endpoint, setEndpoint] = useState(config.endpoint);
  const [folioField, setFolioField] = useState(config.folioField);
  const [testFolio, setTestFolio] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  // Batch fetch state
  const [batchProgress, setBatchProgress] = useState(null); // { current, total, found } | null
  const [batchResult, setBatchResult] = useState(null);
  const [batchAbortController, setBatchAbortController] = useState(null);

  const handleSave = () => {
    onChange({ ...config, endpoint, folioField });
    onClearCache(); // invalidate cache when config changes
  };

  const handleBatchFetch = async () => {
    if (!onBatchFetch) return;
    const controller = new AbortController();
    setBatchAbortController(controller);
    setBatchResult(null);
    setBatchProgress({ current: 0, total: totalLeads || 0, found: 0 });
    try {
      const result = await onBatchFetch(
        (current, total, found) => setBatchProgress({ current, total, found }),
        controller.signal
      );
      setBatchResult(result);
    } catch (err) {
      setBatchResult({ error: err.message || "Batch fetch failed" });
    } finally {
      setBatchAbortController(null);
    }
  };

  const handleCancelBatch = () => {
    if (batchAbortController) {
      batchAbortController.abort();
      setBatchAbortController(null);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    // Apply unsaved changes for the test
    const tempConfig = { ...config, endpoint, folioField };
    const result = await fetchCodeViolations(testFolio || "0141360010030", tempConfig);
    setTestResult(result);
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b" style={{ borderColor: "#e2e8f0" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>Code Violations API</h2>
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>Live integration with Miami-Dade County GIS Open Data</p>
            </div>
            <button onClick={onClose} className="text-2xl" style={{ color: "#64748b" }}>×</button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-lg p-3" style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}>
            <div className="text-[11px] font-bold tracking-wider mb-1" style={{ color: "#15803d" }}>★ LIVE PUBLIC API — NO LOGIN REQUIRED</div>
            <div className="text-xs leading-relaxed" style={{ color: "#15803d" }}>
              This is the only data source in the dashboard that's a real-time API. Miami-Dade County publishes Code Compliance Violations as a free ArcGIS Open Data layer. The dashboard queries it directly when you open a lead.
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-wider mb-1 block" style={{ color: "#64748b" }}>FEATURESERVICE ENDPOINT URL</label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-xs font-mono"
              style={{ borderColor: "#cbd5e1" }}
              placeholder="https://gisweb.miamidade.gov/arcgis/rest/services/.../FeatureServer/0/query"
            />
            <div className="text-[10px] mt-1" style={{ color: "#64748b" }}>
              Should end with <code className="bg-slate-100 px-1">/query</code>. To find the correct URL, open <a href="https://gisweb.miamidade.gov/arcgis/rest/services" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#1e40af" }}>the Miami-Dade GIS REST index</a> and look for the FeatureServer with the Code Compliance Violation layer.
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-wider mb-1 block" style={{ color: "#64748b" }}>FOLIO FIELD NAME</label>
            <input
              type="text"
              value={folioField}
              onChange={(e) => setFolioField(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-xs font-mono"
              style={{ borderColor: "#cbd5e1" }}
              placeholder="FOLIO"
            />
            <div className="text-[10px] mt-1" style={{ color: "#64748b" }}>
              The field in the dataset that holds the parcel folio number. Common values: FOLIO, FOLIO_NUMBER, PARCEL_ID, PARCELID. To verify, open the endpoint URL (without ?query) in a browser and look at the "fields" list.
            </div>
          </div>

          <div className="rounded-lg p-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div className="text-[10px] font-bold tracking-wider mb-2" style={{ color: "#475569" }}>TEST THE CONNECTION</div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={testFolio}
                onChange={(e) => setTestFolio(e.target.value)}
                placeholder="Test folio (or leave blank for default)"
                className="flex-1 px-3 py-2 rounded-lg border text-xs font-mono"
                style={{ borderColor: "#cbd5e1" }}
              />
              <button onClick={handleTest} disabled={testing} className="px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: testing ? "#94a3b8" : "#1e40af" }}>
                {testing ? "Testing..." : "Test"}
              </button>
            </div>
            {testResult && (
              <div className="rounded p-2 text-xs" style={{
                background: testResult.error ? "#fee2e2" : "#dcfce7",
                border: `1px solid ${testResult.error ? "#fecaca" : "#bbf7d0"}`,
                color: testResult.error ? "#991b1b" : "#15803d",
              }}>
                {testResult.error ? (
                  <>
                    <strong>Error:</strong> {testResult.error}
                    <div className="text-[10px] mt-1">Common fixes: (1) Open endpoint URL in browser to confirm it returns JSON; (2) check the layer index (try /0, /1, /2 etc); (3) verify the folio field name; (4) the server may not allow CORS — try a different endpoint.</div>
                  </>
                ) : (
                  <>
                    <strong>✓ Success:</strong> Found {testResult.violations.length} record{testResult.violations.length !== 1 ? "s" : ""}.
                    {testResult.violations.length > 0 && (
                      <div className="text-[10px] mt-1 font-mono">
                        First record: {testResult.violations[0].caseNumber || "(no case #)"} · {testResult.violations[0].type || "(no type)"} · {testResult.violations[0].status || "(no status)"}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg p-3" style={{ background: "#dbeafe", border: "1px solid #bfdbfe" }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[10px] font-bold tracking-wider" style={{ color: "#1e40af" }}>BATCH FETCH ALL LEADS</div>
                <div className="text-[11px]" style={{ color: "#1e40af" }}>
                  Pre-warm the violations cache for {totalLeads ? `${totalLeads} active leads` : "every active lead"} so sidebar counts reflect reality without opening each one.
                </div>
              </div>
              {!batchAbortController && !batchProgress && (
                <button onClick={handleBatchFetch} className="px-3 py-2 rounded-lg text-xs font-bold text-white whitespace-nowrap" style={{ background: "#1e40af" }}>
                  Fetch All
                </button>
              )}
              {batchAbortController && (
                <button onClick={handleCancelBatch} className="px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap" style={{ background: "white", color: "#991b1b", border: "1px solid #fecaca" }}>
                  Cancel
                </button>
              )}
            </div>

            {batchProgress && batchAbortController && (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold mb-1" style={{ color: "#1e40af" }}>
                  <span>{batchProgress.current} / {batchProgress.total} leads · {batchProgress.found} violations found</span>
                  <span>{batchProgress.total > 0 ? Math.round((batchProgress.current / batchProgress.total) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#bfdbfe" }}>
                  <div className="h-full transition-all" style={{
                    width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%`,
                    background: "#1e40af",
                  }}></div>
                </div>
              </div>
            )}

            {batchResult && !batchAbortController && (
              <div className="mt-3 rounded p-2 text-xs" style={{
                background: batchResult.error ? "#fee2e2" : "#dcfce7",
                border: `1px solid ${batchResult.error ? "#fecaca" : "#bbf7d0"}`,
                color: batchResult.error ? "#991b1b" : "#15803d",
              }}>
                {batchResult.error ? (
                  <>
                    <strong>Batch fetch error:</strong> {batchResult.error}
                    {batchResult.processedFolios > 0 && (
                      <div className="text-[10px] mt-1">Partial results saved: {batchResult.processedFolios} leads processed before failure.</div>
                    )}
                  </>
                ) : (
                  <>
                    <strong>✓ Done.</strong> Fetched {batchResult.processedFolios} leads · found {batchResult.totalViolationsFound} violations. Sidebar counts now reflect the full pipeline.
                  </>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg p-3" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
            <div className="text-[10px] font-bold tracking-wider mb-1.5" style={{ color: "#92400e" }}>HOW TO FIND THE EXACT URL (90 seconds)</div>
            <div className="text-[11px] mb-2" style={{ color: "#92400e" }}>
              ArcGIS Web Apps load their service URLs dynamically — you can extract them from your browser's DevTools:
            </div>
            <ol className="text-[11px] space-y-1 list-decimal pl-4" style={{ color: "#92400e" }}>
              <li>Open <a href="https://gisweb.miamidade.gov/codeviolations/" target="_blank" rel="noopener noreferrer" className="underline font-bold">the Miami-Dade Code Violations map</a></li>
              <li>Press <code className="bg-yellow-200 px-1 rounded">F12</code> (or right-click → Inspect) → click <strong>Network</strong> tab</li>
              <li>In the Network tab filter, type <code className="bg-yellow-200 px-1 rounded">FeatureServer</code> or <code className="bg-yellow-200 px-1 rounded">query</code></li>
              <li>Click anywhere on the map / search a property — this triggers the API call</li>
              <li>You'll see one or more requests appear. Click on the one that returns violation data — copy the <strong>Request URL</strong></li>
              <li>Strip everything after <code className="bg-yellow-200 px-1 rounded">/query</code> and paste here. Done.</li>
            </ol>
            <div className="text-[10px] mt-2 pt-2 border-t" style={{ borderColor: "#fde68a", color: "#92400e" }}>
              While you're in the response, also note the <strong>field names</strong> shown — that's where you'll find the right value for the Folio Field above (look for FOLIO, FOLIO_NUMBER, PARCEL_ID, etc.).
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t" style={{ borderColor: "#e2e8f0" }}>
            <button onClick={onClearCache} className="px-3 py-2 rounded-lg text-xs font-bold" style={{ background: "#f1f5f9", color: "#475569" }}>
              Clear Cache
            </button>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-3 py-2 rounded-lg text-xs font-bold" style={{ background: "#f1f5f9", color: "#475569" }}>Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: "#16a34a" }}>Save & Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GhlSettingsModal({ webhooks, onChangeWebhooks, activity, onTestWebhook, onClose }) {
  const eventTypes = [
    { key: "outreach_unlocked",       label: "Outreach Unlocked",     priority: "high",   description: "MLS Active/Pending → Expired or Canceled. Most time-sensitive — fire your direct-mail or SMS workflow here." },
    { key: "tax_deed_filed",          label: "Tax Deed Application",  priority: "high",   description: "~3 month deadline before forced sale. SMS-tier urgency." },
    { key: "new_lis_pendens",         label: "New Lis Pendens",       priority: "high",   description: "First 7 days are highest conversion. Drop into your pre-foreclosure workflow." },
    { key: "deed_recorded",           label: "Deed Recorded",         priority: "high",   description: "Property sold or transferred. Lead may need to close (sold) or owner rewrite (inherited / QCD)." },
    { key: "score_threshold_crossed", label: "Score Crossed Hot",     priority: "medium", description: "Lead just hit ≥70 — escalate to call queue." },
    { key: "came_back_to_market",     label: "Came Back to Market",   priority: "medium", description: "Pending → Active. Track for the inevitable Expired (outreach still blocked)." },
    { key: "code_lien_recorded",      label: "Code Lien Recorded",    priority: "medium", description: "Owner pain just got real. Add to longer-form mail nurture." },
  ];

  const updateUrl = (key, val) => onChangeWebhooks({ ...webhooks, [key]: val.trim() });
  const configuredCount = Object.values(webhooks).filter(Boolean).length;

  const formatRelative = (iso) => {
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "#e2e8f0" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>GHL Webhook Integration</h2>
              <div className="text-sm" style={{ color: "#64748b" }}>
                {configuredCount > 0 ? `${configuredCount} webhook${configuredCount === 1 ? "" : "s"} configured` : "No webhooks connected yet"}
              </div>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#64748b" }} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* SETUP INSTRUCTIONS */}
          <div className="rounded-xl p-4 border" style={{ borderColor: "#bfdbfe", background: "#eff6ff" }}>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#2563eb" }} />
              <div className="text-sm" style={{ color: "#1e40af" }}>
                <strong className="block mb-1">How to wire this up (one-time, ~10 minutes):</strong>
                <ol className="list-decimal ml-5 space-y-1 text-xs leading-relaxed">
                  <li>In GHL, go to <strong>Automation → Workflows</strong> and click <strong>Create Workflow</strong>.</li>
                  <li>Set the trigger to <strong>Inbound Webhook</strong>. Copy the URL GHL gives you.</li>
                  <li>Paste the URL into the matching event below and click <strong>Test</strong> — a sample payload fires.</li>
                  <li>Back in GHL, look at the captured webhook data and map fields to your contact / custom fields.</li>
                  <li>Add your action steps (send SMS, mail, apply tags, push to pipeline, etc.).</li>
                  <li>Publish the workflow. Future alerts of this type fire it automatically.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* WEBHOOK URL CONFIGURATION */}
          <div>
            <div className="text-xs font-bold tracking-wider mb-3" style={{ color: "#64748b" }}>WEBHOOK URLS PER EVENT</div>
            <div className="space-y-3">
              {/* Bulk export — special, top of the list */}
              <WebhookRow
                label="Bulk Export (GHL CSV button)"
                description="When you click GHL CSV, also POST every lead to this workflow URL in real time so they create as GHL contacts immediately."
                priority="bulk"
                value={webhooks.bulk_export}
                onChange={(v) => updateUrl("bulk_export", v)}
                onTest={() => onTestWebhook("bulk_export")}
                connected={!!webhooks.bulk_export}
              />
              <div className="text-xs font-bold tracking-wider mt-5 mb-2 pt-3 border-t" style={{ color: "#64748b", borderColor: "#e2e8f0" }}>EVENT-TRIGGERED WEBHOOKS</div>
              {eventTypes.map((evt) => (
                <WebhookRow
                  key={evt.key}
                  label={evt.label}
                  description={evt.description}
                  priority={evt.priority}
                  value={webhooks[evt.key]}
                  onChange={(v) => updateUrl(evt.key, v)}
                  onTest={() => onTestWebhook(evt.key)}
                  connected={!!webhooks[evt.key]}
                />
              ))}
            </div>
          </div>

          {/* SAMPLE PAYLOAD */}
          <details className="rounded-xl border" style={{ borderColor: "#e2e8f0" }}>
            <summary className="px-4 py-3 cursor-pointer font-bold text-sm flex items-center justify-between" style={{ color: "#0f172a" }}>
              <span>Sample Payload (what gets POSTed to GHL)</span>
              <ChevronRight className="w-4 h-4" style={{ color: "#64748b" }} />
            </summary>
            <div className="px-4 pb-4">
              <pre className="text-[10px] font-mono p-3 rounded-lg overflow-x-auto leading-snug" style={{ background: "#0f172a", color: "#94e2d5" }}>{JSON.stringify({
                firstName: "ANGELA",
                lastName: "PEREZ",
                name: "PEREZ ANGELA M",
                address1: "8845 SW 142ND CT",
                city: "MIAMI",
                state: "FL",
                postalCode: "33186",
                country: "US",
                tags: ["PFC Auction", "Absentee-OutofState", "Tax-delinquent", "STACKED"],
                customFields: {
                  folio: "30-4015-002-1200",
                  motivatedScore: 95,
                  leadType: "PFC Auction",
                  amountOwed: 247000,
                  filedDate: "2026-04-28",
                  mlsStatus: "Off-Market",
                  mailingAddress: "PO BOX 884401",
                  mailingCityStateZip: "MIAMI, FL 33188-4401",
                  estateTag: "Possible EST OF",
                  yearsHeld: 32,
                  absenteeTier: "Out of State",
                  absenteeMailingLocation: "NEW YORK, NY 10022",
                  absenteeIsLlc: false,
                  zillowUrl: "https://www.zillow.com/homes/8845-SW-142ND-CT-MIAMI-FL-33186_rb/",
                  streetViewUrl: "https://www.google.com/maps?q=&layer=c&cbll=25.679,-80.4017",
                  propertyAppraiserUrl: "https://apps.miamidadepa.gov/propertysearch/#/?folio=3040150021200",
                },
                event: { alertType: "outreach_unlocked", alertPayload: { from: "Active", to: "Expired", listPriceWasAt: 525000, daysOnMarket: 87 }, alertTime: "2026-05-07T15:00:00Z" },
                timestamp: "2026-05-07T15:00:00.000Z",
              }, null, 2)}</pre>
            </div>
          </details>

          {/* ACTIVITY LOG */}
          <div>
            <div className="text-xs font-bold tracking-wider mb-3 flex items-center gap-2" style={{ color: "#64748b" }}>
              <Bell className="w-3.5 h-3.5" /> ACTIVITY LOG <span className="font-normal" style={{ color: "#94a3b8" }}>· last 100 events</span>
            </div>
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
              {activity.length === 0 ? (
                <div className="text-center py-8 text-sm" style={{ color: "#94a3b8" }}>
                  <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No webhook activity yet — configure URLs and click Test, or wait for live alerts to fire
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {activity.map((entry) => (
                    <div key={entry.id} className="px-4 py-2.5 border-b text-xs flex items-center gap-3" style={{ borderColor: "#f1f5f9" }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: entry.success ? "#dcfce7" : "#fee2e2" }}>
                        {entry.success ? <CheckCheck className="w-3 h-3" style={{ color: "#15803d" }} /> : <X className="w-3 h-3" style={{ color: "#991b1b" }} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold" style={{ color: "#0f172a" }}>{entry.eventType}</div>
                        <div className="truncate" style={{ color: "#64748b" }}>{entry.leadAddress} · HTTP {entry.status} · {entry.response}</div>
                      </div>
                      <span className="text-[10px] flex-shrink-0" style={{ color: "#94a3b8" }}>{formatRelative(entry.at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg p-3 flex items-start gap-2 text-xs" style={{ background: "#fef3c7", color: "#854d0e" }}>
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="leading-relaxed">
              <strong>Note on testing:</strong> If a URL doesn't start with <code className="px-1 rounded font-mono" style={{ background: "#fde68a" }}>http</code>, the dashboard simulates the response so you can preview behavior without a real GHL account. Real URLs (those starting with <code className="px-1 rounded font-mono" style={{ background: "#fde68a" }}>https://services.leadconnectorhq.com/hooks/...</code>) post live to GHL.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebhookRow({ label, description, priority, value, onChange, onTest, connected }) {
  const priorityBadge = priority === "high" ? { bg: "#fee2e2", color: "#991b1b", text: "HIGH" }
                      : priority === "medium" ? { bg: "#fef3c7", color: "#854d0e", text: "MED" }
                      : priority === "bulk" ? { bg: "#dbeafe", color: "#1e40af", text: "BULK" }
                      : null;
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: connected ? "#bbf7d0" : "#e2e8f0", background: connected ? "#f0fdf4" : "white" }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-sm" style={{ color: "#0f172a" }}>{label}</span>
            {priorityBadge && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: priorityBadge.bg, color: priorityBadge.color }}>{priorityBadge.text}</span>
            )}
            {connected && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1" style={{ background: "#dcfce7", color: "#15803d" }}>
                <CheckCheck className="w-2.5 h-2.5" /> CONNECTED
              </span>
            )}
          </div>
          <div className="text-[11px]" style={{ color: "#64748b" }}>{description}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://services.leadconnectorhq.com/hooks/..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border text-xs font-mono outline-none"
          style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0f172a" }}
        />
        <button
          onClick={onTest}
          disabled={!value}
          className="px-3 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: value ? "#2563eb" : "#e2e8f0", color: value ? "white" : "#94a3b8" }}
        >
          Test
        </button>
      </div>
    </div>
  );
}


function ImportInfoModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "#e2e8f0" }}>
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6" style={{ color: "#2563eb" }} />
            <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>Import Tax / Lead List</h2>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#64748b" }} /></button>
        </div>
        <div className="p-6 space-y-4 text-sm" style={{ color: "#334155" }}>
          <div className="rounded-lg p-4 flex items-start gap-3" style={{ background: "#fef3c7", color: "#854d0e" }}>
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block mb-1">This dashboard is a prototype.</strong>
              In production, you'll connect this importer to your ingestion pipeline. See the companion <em>Manual & Automation Guide</em> for source-by-source instructions.
            </div>
          </div>
          <div>
            <strong>Expected CSV columns:</strong>
            <pre className="mt-2 p-3 rounded-lg text-xs font-mono" style={{ background: "#f1f5f9", color: "#0f172a" }}>folio, owner_name, property_address, property_city,{"\n"}mailing_address, mailing_city, lead_type, filed_date,{"\n"}amount, doc_number, legal_desc, source_url</pre>
          </div>
          <div className="text-xs" style={{ color: "#64748b" }}>
            On import, the system applies the motivated-seller scoring algorithm, stacks duplicate folios across lead types (the STACKED flag), and joins each row to the live Property Appraiser record using the folio number.
          </div>
        </div>
      </div>
    </div>
  );
}
