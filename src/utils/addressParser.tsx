const knownCities = [
  "Taipei City",
  "New Taipei City",
  "Taoyuan City",
  "Taichung City",
  "Tainan City",
  "Kaohsiung City",
  "Keelung City",
];

export default function parseAddress(address: string): {
  city?: string;
  district?: string;
  postalCode?: string;
  street?: string;
} {
  // 按逗號分割地址並去除空白
  const parts = address.split(",").map((part) => part.trim());

  let postalCode = "";
  let city = "";
  let district = "";
  const streetParts: string[] = [];

  // 創建一個副本來標記哪些部分已被處理
  const processed = Array(parts.length).fill(false);

  // 首先，尋找郵遞區號（3到5位數字）
  parts.forEach((part, index) => {
    const postalMatch = part.match(/(\d{3,5})/);
    if (postalMatch && !postalCode) {
      postalCode = postalMatch[1];
      processed[index] = true;
    }
  });

  // 其次，尋找城市名稱
  knownCities.forEach((knownCity) => {
    const index = parts.findIndex((part) => part === knownCity);
    if (index !== -1 && !city) {
      city = knownCity;
      processed[index] = true;
    }
  });

  // 接著，尋找區域名稱（包含 "District" 的部分）
  const districtIndex = parts.findIndex((part) => part.endsWith("District"));
  if (districtIndex !== -1 && !district) {
    const districtMatch = parts[districtIndex].match(/^(.*?)\s*District$/);
    if (districtMatch) {
      district = districtMatch[1];
      processed[districtIndex] = true;
    }
  }

  // 最後，將未處理的部分合併為街道地址
  parts.forEach((part, index) => {
    if (!processed[index] && part !== "Taiwan") {
      // 忽略 "Taiwan"
      streetParts.push(part);
    }
  });

  const street = streetParts.join(", ");

  return {
    city: city || undefined,
    district: district || undefined,
    postalCode: postalCode || undefined,
    street: street || undefined,
  };
}
