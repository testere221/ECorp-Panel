'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Section {
  id: string;
  icon: string;
  title: string;
  content: string[];
}

export default function CompanyProfilePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('intro');

  const sections: Section[] = [
    {
      id: 'intro',
      icon: '🌟',
      title: 'E-Corp Nedir?',
      content: [
        'E-Corp, basitçe söylemek gerekirse, insanların birbirine güvendiği ve banka, devlet gibi kurumların dışında bir dayanışma sistemi. İnsanlar para yatırıyor, bu paralar yeni katılımcılardan geliyor ve böylece sistem büyüyor. Burada amaç, insanları sömürmek değil, ortaklaşa yardım etmek.',
        'Sistemde "onluklar", "yüzlükler", "binlikler" gibi seviyeler var. Bunlar birbirlerini eğitiyor, destekliyor. Her şey açık ve şeffaf.',
        'Kısacası, E-Corp finansal kölelikten kurtulmak isteyenlerin yolu. Ama tembel ve saf olanlara göre değil.',
      ],
    },
    {
      id: 'vision',
      icon: '✊',
      title: 'Vizyonumuz',
      content: [
        'Barış. Özgürlük.',
        'Bir milyar katılımcı.',
        'E-Corp, içinde yalnız olmadığınız bir sistemdir.',
      ],
    },
    {
      id: 'manifesto1',
      icon: '💰',
      title: 'Manifesto: Giriş',
      content: [
        '"Bu kadar yeter."',
        'Daha ne kadar numara yapacaksın? Sorun yok?',
        'Bu enflasyon "doğaldır".',
        '12.000 emekli maaşı için 40 yıl çalışmanın "makul" olduğu.',
        '"Bankanın para verdiğini" - hiç parası olmamasına rağmen.',
        'Bu borç "ekonomi"dir.',
        '"Karmaşık" olduğunu ve "bu işte iyi olmadığınızı".',
        'Hayır. Zor değil. Utanç verici değil. Sadece bir yalan.',
        '',
        'İçinde yaşadığımız absürdün finansal tiyatrosu.',
        'Size numaraların verildiği ve "onlar için çalışmanızın" söylendiği yer.',
        'Havadan yaratılan bir şey için ödeme yapmanız gereken yer.',
        'Hayatın nerede tahmini yüzde.',
      ],
    },
    {
      id: 'manifesto2',
      icon: '🧠',
      title: 'Dünyayı Kim Yönetiyor?',
      content: [
        'Eğer hala başkanların dünyayı yönettiğini düşünüyorsanız - özür dilerim, her şey boyunca uyudum.',
        'Başkanlar gel ve git.',
        'Partiler mücadele ve değişim.',
        'Halklar ödeme ve umut.',
        'Ve yöneticiler - para akışını kontrol edenler.',
        '',
        '💵 Para emek değildir.',
        'Bu bir "fayda karşılığı takas" değildir.',
        'Bu yaşam hakkı sayılar şeklinde düzenlenmiştir.',
        '',
        '🏦 Bankalar kasa değildir.',
        'Bu onay merkezleri. Size para "vermezler" - size hava izni verirler, yeni bastıkları.',
        'Övgüyü sen alırsın. Bir yüzde ile birlikte gelir.',
        'Bir şeyi geri veriyorsun yoktu, ve bunun bedelini gerçek emekle yarattığınız bir şeyle ödüyorsunuz.',
        'Bu finansal köle sistemidir. Sadece devreler elektroniktir ve gönüllülük esasına dayanır.',
      ],
    },
    {
      id: 'manifesto3',
      icon: '📉',
      title: 'Neden Fakirsiniz?',
      content: [
        '"Yeterince sıkı çalışmadığınız" için yoksul değilsiniz.',
        'Yoksulsunuz çünkü sistem bu şekilde kurulmuş, işiniz başkalarının kârına hizmet etmekti.',
        '',
        'Size oyuncaklar verdiler ve anlamını elinizden aldılar.',
        'Hayatı kolaylaştırdı - ama özgür değil.',
        'İki tıklamayla suşi siparişi verebilirsiniz, ama kendinize bir haftalık huzur satın alamazsınız.',
        '',
        'Görünüşe göre iyi bir hayat yaşıyorsun:',
        '- Bir akıllı telefonunuz var',
        '- Netflix aboneliği var',
        '- Yılda bir kez tatil bile',
        '',
        'Ama sen özgürlük marjı yok:',
        '- Maaşınıza bağımlısınız',
        '- Bankadan',
        '- Artan fiyatlardan',
        '- "30 yıllık mortgage almanıza izin verecekler mi" sorusundan',
        '',
        '📌 Hiçbir şeyin sahibi değilsin.',
        'Satın aldığın şeyle bile. Dairenin sahibi banka. Araba kredili. Para dondurulabilecek bir hesapta.',
        '',
        '📌 Bolluk yanılsaması = boyun eğdirme gerçeği.',
      ],
    },
    {
      id: 'manifesto4',
      icon: '🔒',
      title: 'Neden İçeriden Düzeltilemez?',
      content: [
        'Size "Rütben ne?" diye sormazlar.',
        'Sana soruluyor: "Var mısın?"',
        '',
        '🛠 Yeni mantık "karlılık" ve "ROI" ile ilgili değildir.',
        'Mesele şu ki her bir katılımcının tüm sistemi etkilediği.',
        '',
        '📌 "Döviz kuruna karar veren" tek kişi Merkez Bankası değildir.',
        '📌 Binlerce katılımcı bunu yaratıyor - taleple, katılımla, hareketle.',
        '',
        'Ve bu, zirvede olmaya alışkın olanlar için korkutucu.',
        'Ama dürüst olmak gerekirse - her zaman en altta olanlar için.',
      ],
    },
    {
      id: 'who',
      icon: '🧬',
      title: 'Biz Kimiz?',
      content: [
        'Biz bir şirket değiliz. Biz bir startup değiliz.',
        'Bir "ofisimiz", "personelimiz" ya da "halkla ilişkilerimiz" yok.',
        '',
        'Bizler katılımcılarız.',
        '📌 Bizler beklemekten yorulduk birileri bizi "kurtarırken".',
        '📌 Bizler katılmıyoruz onların ruhsuz makinesinde bir dişli olmak.',
        '📌 Bizler gerçek gücün yetki vermek olmadığını fark ettik, referans çerçevesi.',
        '',
        'Biz devrimci değiliz. Kaza yapmak istemiyoruz.',
        'Biz sadece artık onların oyununu oynamıyoruz.',
        '',
        'Bizim düşmanımız yok.',
        'Biz devletlere karşı değiliz, bankalara karşı değiliz, "eski ekonomiye" karşı değiliz.',
        'Biz sadece dışarıda olmayı seçtik.',
        '',
        'Kim olduğumuzu öğrenmek ister misin? Bizler:',
        '- Daha fazla maaş çekiyle yaşamıyor',
        '- Daha fazla "kene ile imzaya" inanmıyor',
        '- Daha fazla birilerinin bizi "yetkilendirmesini" beklemez',
        '- Daha fazla "sistemin garantilerine" ihtiyaç duymaz',
        '',
        'Biz "alternatif" değiliz. Bizler yeni temel.',
      ],
    },
    {
      id: 'choice',
      icon: '🔮',
      title: 'Y Kuşağı Seçimi',
      content: [
        'Bunun biletlerle ilgili olduğunu mu düşünüyorsun? Faiz hakkında mı? "Yeni fırsat" hakkında mı?',
        'Hayır.',
        '📌 Yapmanız gereken seçimle ilgili insanoğlu her zaman.',
        '📌 Sadece şimdi bariz. Ve neredeyse hiç zaman kalmadı.',
        '',
        '✊ Ya da sen bir yarışmacısın.',
        'O kişi canlı bir şeyin parçası olmaktan korkmaz.',
        'O kişi başkalarından sorumlu. Vites değiştirmiyor.',
        'O kişi hamle yapar. Şikayet etmiyor.',
        '',
        '🪤 Ya da siz bir tüketicisiniz.',
        'Ödeyeceksin ve soyulacaksın. Umut edersiniz ve unutulursunuz.',
        'Başkasının sistemine yatırım yapıyorsunuz. Sizi köleleştiren bir şeyi savunuyorsunuz.',
        '',
        'Eski sistem diyor ki:',
        '- "Uslu dur." - "Başını aşağıda tut." - "Çalış, sessiz ol, tasarruf et."',
        '',
        '📌 Diyoruz ki:',
        '- İzin beklemeyin - Stroi - Bağlan - Katılın - Canlı yayın',
      ],
    },
    {
      id: 'final',
      icon: '🏁',
      title: 'Son Nokta',
      content: [
        'Sormuyoruz. İkna edici değiliz. Aramayız bile.',
        '',
        '📌 Biz sadece sistemi açtık,',
        'İçinde sen bir çark değilsin, vakıf.',
        'İçinde merkez yok, ama var güven düğümleri.',
        'İçinde müşteri değilsin, anlam aksesuarı.',
        '',
        'E-Corp bir proje değil.',
        'Bu başka bir "para kazanma yolu" değildir.',
        'Bu sadece bir sistem bile değil.',
        '📌 Bu - İşleri farklı şekilde yapabileceğinizi gösteren bir sembol.',
        '',
        'Bu manifestoyu kapatabilir ve bildiklerinize geri dönebilirsiniz:',
        'taksitlerle, raporlarla, faizlerle, "beklemek zorundayız"larla.',
        '',
        'Yapabilir misin? Etrafta takıl. Bizimle birlikte.',
        'Kimlere beklemeyi bıraktı ve yapmaya başladı.',
        '',
        'Biz güç istemiyoruz. Biz devrim istemiyoruz.',
        'Biz sadece emin olmak istiyoruz insan yine insandır.',
        'Bir fonksiyon değil. Bir birim değil. Borçlu değil.',
        'Ama yaşayan bir varlık, güvenme, seçme ve katılma hakkıyla.',
        '',
        '📌 Ve eğer okuduklarınızın yarısını anlıyorsanız - bu da demek oluyor ki birden fazla.',
      ],
    },
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white pb-24">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 p-8 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            E-CORP
          </h1>
          <p className="text-xl md:text-2xl font-bold mb-2">
            ✊ Bir proje değil. Bir iş değil. Bir söz değil.
          </p>
          <p className="text-lg md:text-xl opacity-90">
            💥 Sistem. Fikir. Araç. 🧬 Canlı Ağ.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Manifesto Sections */}
      <div className="px-4 py-6 space-y-3 max-w-4xl mx-auto">
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden hover:border-purple-500 transition-all"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <span className="text-4xl">{section.icon}</span>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>
              {expandedSection === section.id ? (
                <ChevronUp className="text-purple-400" size={24} />
              ) : (
                <ChevronDown className="text-slate-400" size={24} />
              )}
            </button>

            {expandedSection === section.id && (
              <div className="px-6 pb-6 pt-2 space-y-3 animate-slide-in">
                {section.content.map((paragraph, index) => (
                  <p
                    key={index}
                    className={`${
                      paragraph === ''
                        ? 'h-2'
                        : paragraph.startsWith('-')
                        ? 'text-slate-300 pl-4 border-l-2 border-purple-500'
                        : paragraph.startsWith('📌') || paragraph.startsWith('✊') || paragraph.startsWith('🪤')
                        ? 'text-purple-200 font-semibold text-lg'
                        : paragraph.includes('💵') || paragraph.includes('🏦') || paragraph.includes('👔') || paragraph.includes('🧮')
                        ? 'text-yellow-200 font-medium'
                        : 'text-slate-200'
                    } leading-relaxed`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="px-4 mt-8 mb-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 text-center shadow-2xl">
          <h3 className="text-3xl font-black mb-4">E-Corp International</h3>
          <p className="text-xl font-bold mb-2">✊ Bir proje değil. Bir iş değil. Bir söz değil.</p>
          <p className="text-lg">💥 Sistem. Fikir. Araç.</p>
          <p className="text-lg">🧬 Canlı Ağ.</p>
          <div className="mt-6 flex items-center justify-center space-x-2">
            <div className="h-1 w-12 bg-white rounded-full"></div>
            <span className="text-sm font-medium">Barış. Özgürlük. Bir milyar katılımcı.</span>
            <div className="h-1 w-12 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

