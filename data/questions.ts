export interface Question {
  id: string;
  text: string;
}

export interface Dimension {
  id: string;
  name: string;
  questions: Question[];
}

export const DIMENSIONS: Dimension[] = [
  {
    id: "strategic_alignment",
    name: "Stratejik Hizalama",
    questions: [
      { id: "q1_1", text: "Akademi stratejik plan ile doğrudan ilişkilidir." },
      { id: "q1_2", text: "Gelişim programları iş KPI'ları ile bağlantılıdır." },
      { id: "q1_3", text: "Üst yönetim akademiyi stratejik bir kaldıraç olarak görür." },
      { id: "q1_4", text: "Akademi bütçesi stratejik önceliklere göre belirlenir." },
      { id: "q1_5", text: "Kritik roller için gelişim yol haritası tanımlıdır." },
    ],
  },
  {
    id: "competency_architecture",
    name: "Yetkinlik Mimarisi",
    questions: [
      { id: "q2_1", text: "Kurumsal yetkinlik seti net tanımlıdır." },
      { id: "q2_2", text: "Yetkinlikler seviyelendirilmiştir." },
      { id: "q2_3", text: "Yetkinlikler performans sistemi ile entegredir." },
      { id: "q2_4", text: "Teknik ve liderlik yetkinlikleri ayrıştırılmıştır." },
      { id: "q2_5", text: "Yetkinlikler yılda en az bir kez gözden geçirilir." },
    ],
  },
  {
    id: "leadership_development",
    name: "Liderlik Gelişim Sistemi",
    questions: [
      { id: "q3_1", text: "Liderlik gelişimi sistematik bir programa bağlıdır." },
      { id: "q3_2", text: "Lider adayları için pipeline modeli vardır." },
      { id: "q3_3", text: "Koçluk veya mentorluk sistemi mevcuttur." },
      { id: "q3_4", text: "360 geri bildirim gibi araçlar kullanılır." },
      { id: "q3_5", text: "Liderlik programları iş sonuçlarına bağlanır." },
    ],
  },
  {
    id: "digital_technology",
    name: "Dijital & Teknoloji Entegrasyonu",
    questions: [
      { id: "q4_1", text: "Akademi bir LMS/LXP platformuna sahiptir." },
      { id: "q4_2", text: "Eğitim verileri düzenli analiz edilir." },
      { id: "q4_3", text: "Dijital içerik oranı yüksektir." },
      { id: "q4_4", text: "Öğrenme deneyimi kişiselleştirilmiştir." },
      { id: "q4_5", text: "AI veya veri analitiği kullanımı vardır." },
    ],
  },
  {
    id: "measurement_analytics",
    name: "Ölçüm & Etki Analitiği",
    questions: [
      { id: "q5_1", text: "Eğitim sonrası davranış değişimi takip edilir." },
      { id: "q5_2", text: "Programların ROI analizi yapılır." },
      { id: "q5_3", text: "KPI etkisi ölçülür." },
      { id: "q5_4", text: "Akademi performans dashboardu vardır." },
      { id: "q5_5", text: "90 gün sonrası etki ölçümü yapılır." },
    ],
  },
  {
    id: "cultural_integration",
    name: "Kültürel Entegrasyon",
    questions: [
      { id: "q6_1", text: "Akademi bir iç marka olarak konumlanmıştır." },
      { id: "q6_2", text: "İç eğitmen sistemi vardır." },
      { id: "q6_3", text: "Mezuniyet veya sertifika sistematiği vardır." },
      { id: "q6_4", text: "Akademi şirket kültürünü destekler." },
      { id: "q6_5", text: "Çalışanlar akademiyi değerli görür." },
    ],
  },
];

export type AnswerMap = Record<string, number>;

export const LIKERT_OPTIONS = [
  { value: 1, label: "Kesinlikle Katılmıyorum" },
  { value: 2, label: "Katılmıyorum" },
  { value: 3, label: "Kısmen" },
  { value: 4, label: "Katılıyorum" },
  { value: 5, label: "Tamamen Katılıyorum" },
];
