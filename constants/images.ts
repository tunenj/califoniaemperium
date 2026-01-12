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
import electronicsIcon from "@/assets/images/electronicsIcon.png";
import computerBg from "@/assets/images/computerBg.png";
import computerIcon from "@/assets/images/computerIcon.png";
import fashionBg from "@/assets/images/fashionBg.png";
import fashionIcon from "@/assets/images/fashionIcon.png";
import groceryBg from "@/assets/images/groceryBg.png";
import groceryIcon from "@/assets/images/groceryIcon.png";
import promoIcon from "@/assets/icons/promoIcon.png";

// Import your category images
import women from '@/assets/images/women.png';
import men from '@/assets/images/men.png';
import kids from '@/assets/images/kid.png';
import dress from '@/assets/images/dress.png';
import jewelry from '@/assets/images/jewelry.png';
import shoes from '@/assets/images/shoes.png';
import tops from '@/assets/images/tops.png';
import underwear from '@/assets/images/underwear.png';
import baby from '@/assets/images/baby.png';
import bags from '@/assets/images/bags.png';
import electronics from '@/assets/images/electronics.png';
import beauty from '@/assets/images/beauty.png';
import fashion from '@/assets/images/fashion.png';
import watches from '@/assets/images/watches.png';
import gadget from '@/assets/images/gadget.png';

//Dashboard images
import jacket from '@/assets/images/jacket.png';
import pairShoe from '@/assets/images/pairShoe.png';
import dashboardIcon from '@/assets/icons/dashboardIcon.png';

// Profile icon on account
import profileAvater from '@/assets/icons/profile-avatar.png'

const images: Record<string, ImageSourcePropType> = {
  onboarding,
  businessIcon,
  customerIcon,
  googleIcon, 
  switchIcon,
  whatsappIcon,
  successIcon,

  // Trending and feature products
  computerBg,
  computerIcon,
  fashionBg,
  fashionIcon,
  electronicsBg,
  electronicsIcon,
  groceryBg,
  groceryIcon,
  promoIcon,

  // Add category images
  women,
  men,
  kids,
  dress,
  jewelry,
  shoes,
  tops,
  underwear,
  baby,
  bags,
  electronics,
  beauty,
  fashion,
  watches,
  gadget,

  // Dashboard images
  jacket,
  pairShoe,
  dashboardIcon

};

export default images;
