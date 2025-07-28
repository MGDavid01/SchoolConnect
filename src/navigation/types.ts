// navigation/types.ts
import { StackNavigationProp } from '@react-navigation/stack';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type ScholarshipType =
  | "Académica"
  | "Deportiva"
  | "Cultural"
  | "Socioeconómica"
  | "Internacional";

export type EducationLevel = "TSU" | "Ingeniería" | "Posgrado";


// navigation/types.ts
export type Scholarship = {
  id: string;
  title: string;
  description: string;
  type: string;
  educationLevel: string;
  amount: string;
  institution: string;
  deadline: string;
  imageUrl?: string;
  requirements: string[];
};

export type PostData = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category?: string;
  imageUrl?: string;
  type: string;
  likes: number;
  dislikes: number;
  comments: Comment[]; // define Comment en otro lado
};

// Tipo que extiende PostData para el componente que necesita más props
export type Post = PostData & {
  expanded: boolean;
  onExpand: () => void;
  onViewMore: () => void;
};

export type RootStackParamList = {
  Scholarship: undefined;
  ScholarshipDetail: { scholarship: Scholarship };
  CreatePost: undefined;
  News: undefined;
  NewsDetail: { post: PostData }; 
  Auth: undefined;
  MainTabs: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type NewsStackParamList = {
  NewsList: undefined;
  NewsDetail: { newsId: string, post: Post };
   // ejemplo
};

export type ScholarshipStackParamList = {
  ScholarshipList: undefined;
  ScholarshipDetail: { id: string };
};

export type User = {
  _id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rol: "alumno" | "docente" | "personal" | "administrador";
  grupoID?: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaNacimiento: Date;
};





export type ScholarshipScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Scholarship'
>;

