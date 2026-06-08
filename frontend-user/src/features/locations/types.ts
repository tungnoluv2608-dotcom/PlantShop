/** Vietnam administrative units from provinces.open-api.vn API v2 (2025). */

export interface VietnamProvince {
  name: string
  code: number
  division_type: string
  codename: string
  phone_code: number
}

export interface VietnamWard {
  name: string
  code: number
  division_type: string
  codename: string
  province_code: number
}

export interface VietnamProvinceDetail extends VietnamProvince {
  wards: VietnamWard[]
}