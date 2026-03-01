import { DIMENSIONS, AnswerMap } from "@/data/questions";

export interface DimensionScore {
  id: string;
  name: string;
  average: number;
  total: number;
  percentage: number;
  comment: string;
}

export interface Results {
  totalScore: number;
  level: number;
  levelName: string;
  levelDescription: string;
  dimensionScores: DimensionScore[];
  strongAreas: DimensionScore[];
  developmentAreas: DimensionScore[];
  actionPlan: string[];
}

export const MATURITY_LEVELS = [
  {
    level: 1,
    name: "Operasyonel Eğitim",
    min: 30,
    max: 60,
    description:
      "Akademi henüz temel operasyonel eğitim fonksiyonlarını yerine getirmektedir. Stratejik bağlantı ve ölçüm altyapısı kurulma aşamasındadır. Temel yapıların oluşturulması öncelikli hedef olmalıdır.",
  },
  {
    level: 2,
    name: "Yapılandırılmış Gelişim",
    min: 61,
    max: 90,
    description:
      "Akademi yapılandırılmış gelişim programlarına sahiptir ancak entegrasyon ve ölçüm boyutlarında iyileştirme alanları mevcuttur. Sistematik yaklaşımların güçlendirilmesi gereklidir.",
  },
  {
    level: 3,
    name: "Entegre Akademi",
    min: 91,
    max: 115,
    description:
      "Akademi, iş süreçleriyle entegre çalışmakta ve ölçüm altyapısı gelişmektedir. Stratejik etkiyi artırmak için dijital araçların ve analitik yeteneklerin güçlendirilmesi önerilir.",
  },
  {
    level: 4,
    name: "Stratejik Akademi",
    min: 116,
    max: 135,
    description:
      "Akademi, kurumun stratejik gündemine güçlü katkı sağlamaktadır. Liderlik geliştirme, yetkinlik mimarisi ve ölçüm sistemleri olgunlaşmıştır. Dönüşüm merkezine evrilmek için son adımlar atılabilir.",
  },
  {
    level: 5,
    name: "Dönüşüm Merkezi",
    min: 136,
    max: 150,
    description:
      "Akademi, kurumsal dönüşümün merkezinde yer almaktadır. Tüm boyutlarda yüksek olgunluk seviyesi gözlemlenmektedir. Bu seviyeyi korumak ve sektörde örnek olmak temel hedef olmalıdır.",
  },
];

function getDimensionComment(average: number): string {
  if (average <= 2) return "Ciddi geliştirme alanı";
  if (average <= 3) return "Orta düzey – geliştirme önerilir";
  return "Güçlü alan";
}

export function calculateResults(answers: AnswerMap): Results {
  const dimensionScores: DimensionScore[] = DIMENSIONS.map((dim) => {
    const scores = dim.questions.map((q) => answers[q.id] || 0);
    const total = scores.reduce((a, b) => a + b, 0);
    const average = total / dim.questions.length;
    const percentage = Math.round((average / 5) * 100);
    return {
      id: dim.id,
      name: dim.name,
      average: Math.round(average * 10) / 10,
      total,
      percentage,
      comment: getDimensionComment(average),
    };
  });

  const totalScore = dimensionScores.reduce((sum, d) => sum + d.total, 0);

  const maturityLevel =
    MATURITY_LEVELS.find((l) => totalScore >= l.min && totalScore <= l.max) ||
    MATURITY_LEVELS[0];

  const sorted = [...dimensionScores].sort((a, b) => b.average - a.average);
  const strongAreas = sorted.slice(0, 2);
  const developmentAreas = sorted.slice(-2).reverse();

  const actionPlan = generateActionPlan(
    maturityLevel.level,
    developmentAreas
  );

  return {
    totalScore,
    level: maturityLevel.level,
    levelName: maturityLevel.name,
    levelDescription: maturityLevel.description,
    dimensionScores,
    strongAreas,
    developmentAreas,
    actionPlan,
  };
}

function generateActionPlan(
  level: number,
  developmentAreas: DimensionScore[]
): string[] {
  const levelActions: Record<number, string[]> = {
    1: [
      "Akademi için net bir vizyon ve misyon belgesi hazırlayın.",
      "Temel yetkinlik çerçevesini oluşturun ve tüm pozisyonlarla eşleştirin.",
      "En az bir LMS/LXP platformunu değerlendirin ve pilot uygulama başlatın.",
    ],
    2: [
      "Gelişim programlarını iş KPI'larıyla ilişkilendiren bir çerçeve oluşturun.",
      "Liderlik pipeline modelini tasarlayın ve ilk adayları belirleyin.",
      "Eğitim sonrası değerlendirme süreçlerini standart hale getirin.",
    ],
    3: [
      "Akademi performans dashboardunu hayata geçirin.",
      "ROI ölçüm metodolojisi geliştirin ve ilk 3 programa uygulayın.",
      "AI destekli kişiselleştirilmiş öğrenme yolları için pilot başlatın.",
    ],
    4: [
      "Dönüşüm merkezi modelini tasarlayın ve üst yönetime sunun.",
      "Sektörde akademi olgunluğu konusunda örnek vaka çalışmaları oluşturun.",
      "Akademi etkisini kurumsal strateji belgelerine entegre edin.",
    ],
    5: [
      "Akademi modelini sektör genelinde paylaşın ve düşünce liderliği oluşturun.",
      "Yenilikçi öğrenme deneyimleri için Ar-Ge bütçesi ayırın.",
      "Uluslararası akademi standartlarıyla kıyaslama yapın.",
    ],
  };

  const baseActions = levelActions[level] || levelActions[1];

  const dimensionActions: Record<string, string[]> = {
    strategic_alignment: [
      "Akademi stratejisini kurumsal strateji ile hizalamak için üst yönetim workshopu düzenleyin.",
      "Her gelişim programı için iş etkisi hedefleri tanımlayın.",
    ],
    competency_architecture: [
      "Yetkinlik çerçevesini güncelleyin ve seviyelendirme yapısını netleştirin.",
      "Yetkinlikleri performans değerlendirme sistemine entegre edin.",
    ],
    leadership_development: [
      "Mentorluk ve koçluk programı başlatın; ilk 10 yöneticiyi eşleştirin.",
      "360 geri bildirim sürecini dijitalleştirin ve sonuçları gelişim planlarına bağlayın.",
    ],
    digital_technology: [
      "LMS/LXP platformunda dijital içerik oranını %60'ın üzerine çıkarın.",
      "Öğrenme analitiği dashboardu oluşturun ve aylık raporlama başlatın.",
    ],
    measurement_analytics: [
      "Her eğitim programı için 30-60-90 gün etki ölçüm planı oluşturun.",
      "Akademi ROI hesaplama şablonu geliştirin.",
    ],
    cultural_integration: [
      "Akademi iç marka kimliğini ve iletişim stratejisini belirleyin.",
      "İç eğitmen programı başlatın; ilk kohortu seçin ve geliştirin.",
    ],
  };

  const extraActions: string[] = [];
  developmentAreas.forEach((area) => {
    const actions = dimensionActions[area.id] || [];
    extraActions.push(...actions);
  });

  return [...baseActions, ...extraActions].slice(0, 6);
}
