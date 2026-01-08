// constants/images.ts
import { ImageSourcePropType } from 'react-native';

import onboarding from '../assets/images/onboarding.png';
import businessIcon from '../assets/images/businessIcon.png';
import customerIcon from '../assets/images/customerIcon.png';
import googleIcon from '../assets/icons/googleIcon.png';
import switchIcon from '../assets/icons/switch.png';
import whatsappIcon from '../assets/icons/whatsapp.png';
import successIcon from '../assets/icons/successIcon.png';
import electronicsBg from "@/assets/images/electronicsBg.png";
import electronicsIcon  from "@/assets/images/electronicsIcon.png";
import computerBg from "@/assets/images/computerBg.png";
import computerIcon from "@/assets/images/computerIcon.png";
import fashionBg from "@/assets/images/fashionBg.png";
import fashionIcon from "@/assets/images/fashionIcon.png";
import groceryBg from "@/assets/images/groceryBg.png";
import groceryIcon from "@/assets/images/groceryIcon.png";

const images: Record<string, ImageSourcePropType> = {
  onboarding,
  businessIcon,
  customerIcon,
  googleIcon, 
  switchIcon,
  whatsappIcon,
  successIcon,
  computerBg,
  computerIcon,
  fashionBg,
  fashionIcon,
  electronicsBg,
  electronicsIcon,
  groceryBg,
  groceryIcon
};

export default images;