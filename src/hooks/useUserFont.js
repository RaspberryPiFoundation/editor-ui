import { useCookies } from 'react-cookie';

const fontScaleFactors = {'small': 1, 'medium': 1.44, 'large': 2.074}

export const useUserFont = (defaultScale = 1) => {
  const [cookies] = useCookies(['fontSize'])
  const scale = fontScaleFactors[cookies.fontSize] || defaultScale

  return scale
}