
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import {
  Heart,
  Stethoscope,
  Scissors,
  CreditCard,
  CheckCircle2,
  Star,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  MessageSquare,
  MapPin,
  X,
  Dog,
  Cat,
  Rabbit,
  HelpCircle,
  Calendar,
  Activity,
  TrendingDown,
  Sparkles,
  PiggyBank,
  Globe,
  Instagram,
  Menu
} from 'lucide-react';
import { 
  PricingTier, 
  District, 
  PetType, 
  PetAge, 
  VetFrequency, 
  HealthCondition, 
  PetSurveyData, 
  CostBreakdown 
} from './types';
import { translations, Language, Translations } from './translations';

// --- Language Context ---
const LanguageContext = createContext<{
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
});

const useLanguage = () => useContext(LanguageContext);

// --- Sub-components ---

const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useLanguage();
  
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
          lang === 'en' 
            ? 'bg-white text-slate-900 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('de')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
          lang === 'de' 
            ? 'bg-white text-slate-900 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        DE
      </button>
    </div>
  );
};

const Navbar: React.FC = () => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Pet Pass Vienna" className="w-10 h-10 rounded-lg" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Pet Pass <span className="text-emerald-600">Vienna</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">{t.nav.howItWorks}</a>
          <a href="#plans" className="hover:text-emerald-600 transition-colors">{t.nav.plans}</a>
          <a href="#partners" className="hover:text-emerald-600 transition-colors">{t.nav.partners}</a>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher />
          <a
            href="#waitlist"
            className="hidden sm:inline-flex bg-slate-900 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            {t.nav.joinClub}
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors">{t.nav.howItWorks}</a>
            <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors">{t.nav.plans}</a>
            <a href="#partners" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors">{t.nav.partners}</a>
            <a href="#waitlist" onClick={() => setMobileMenuOpen(false)} className="sm:hidden mt-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold text-center hover:bg-slate-800 transition-all">{t.nav.joinClub}</a>
          </div>
        </div>
      )}
    </nav>
  );
};

// Vienna Vet Prices (based on 2025/2026 Austrian veterinary data)
const VIENNA_VET_PRICES = {
  checkup: 40,
  vaccination: {
    basic: 65,
    rabies: 45,
  },
  bloodwork: 75,
  dentalCleaning: 175,
  grooming: {
    dog: 60,
    cat: 45,
    rabbit: 35,
  },
  healthConditionCosts: {
    none: 0,
    allergies: 225,
    diabetes: 600,
    joint_problems: 300,
    skin_conditions: 175,
    digestive_issues: 225,
    heart_conditions: 450,
    dental_problems: 200,
    obesity: 150,
  } as Record<HealthCondition, number>,
  emergencyBufferPercent: 0.15,
};

const PLAN_PRICES = {
  basic: 19,
  care_plus: 39,
  vip: 99,
};

function calculateCosts(data: PetSurveyData): CostBreakdown {
  const { petType, petCount, petAge, vetFrequency, healthConditions, groomingFrequency } = data;
  
  const visitsPerYear: Record<VetFrequency, number> = {
    rarely: 0.5,
    once_year: 1,
    twice_year: 2,
    quarterly: 4,
    monthly: 12,
  };
  
  const checkupsPerYear = visitsPerYear[vetFrequency];
  const annualCheckups = checkupsPerYear * VIENNA_VET_PRICES.checkup * petCount;
  
  let vaccinations = (VIENNA_VET_PRICES.vaccination.basic + VIENNA_VET_PRICES.vaccination.rabies) * petCount;
  
  if (petAge === 'puppy_kitten') {
    vaccinations *= 1.5;
  } else if (petAge === 'senior') {
    vaccinations *= 1.2;
  }
  
  let healthConditionCosts = 0;
  healthConditions.forEach(condition => {
    healthConditionCosts += VIENNA_VET_PRICES.healthConditionCosts[condition];
  });
  healthConditionCosts *= petCount;
  
  if (petAge === 'senior') {
    healthConditionCosts *= 1.3;
  }
  
  const groomingPrice = petType === 'dog' 
    ? VIENNA_VET_PRICES.grooming.dog 
    : petType === 'cat' 
      ? VIENNA_VET_PRICES.grooming.cat 
      : VIENNA_VET_PRICES.grooming.rabbit;
  const grooming = groomingFrequency * groomingPrice * petCount;
  
  const subtotal = annualCheckups + vaccinations + healthConditionCosts + grooming;
  const emergencyBuffer = subtotal * VIENNA_VET_PRICES.emergencyBufferPercent;
  
  const totalWithoutMembership = Math.round(subtotal + emergencyBuffer);
  
  let recommendedPlan: 'basic' | 'care_plus' | 'vip';
  if (healthConditions.length >= 2 || groomingFrequency >= 4 || petAge === 'senior') {
    recommendedPlan = 'vip';
  } else if (healthConditions.length >= 1 || groomingFrequency >= 2 || checkupsPerYear >= 2) {
    recommendedPlan = 'care_plus';
  } else {
    recommendedPlan = 'basic';
  }
  
  const planCost = PLAN_PRICES[recommendedPlan] * 12;
  
  let membershipValue = 0;
  membershipValue += vaccinations;
  
  if (recommendedPlan === 'basic') {
    membershipValue += VIENNA_VET_PRICES.checkup * petCount;
    membershipValue += totalWithoutMembership * 0.05;
  } else if (recommendedPlan === 'care_plus') {
    membershipValue += VIENNA_VET_PRICES.checkup * 2 * petCount;
    membershipValue += totalWithoutMembership * 0.10;
  } else {
    membershipValue += VIENNA_VET_PRICES.checkup * 2 * petCount;
    membershipValue += 4 * groomingPrice * petCount;
    membershipValue += VIENNA_VET_PRICES.dentalCleaning * petCount;
    membershipValue += totalWithoutMembership * 0.20;
  }
  
  const annualSavings = Math.max(0, Math.round(membershipValue - planCost));
  const savingsPercentage = totalWithoutMembership > 0 
    ? Math.round((annualSavings / totalWithoutMembership) * 100) 
    : 0;
  
  return {
    annualCheckups: Math.round(annualCheckups),
    vaccinations: Math.round(vaccinations),
    healthConditionCosts: Math.round(healthConditionCosts),
    grooming: Math.round(grooming),
    emergencyBuffer: Math.round(emergencyBuffer),
    totalWithoutMembership,
    recommendedPlan,
    planCost,
    annualSavings,
    savingsPercentage,
  };
}

const WaitlistModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t, lang } = useLanguage();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState<District>('1st (Innere Stadt)');
  
  const [surveyData, setSurveyData] = useState<PetSurveyData>({
    petType: 'dog',
    petCount: 1,
    petAge: 'adult',
    vetFrequency: 'twice_year',
    healthConditions: ['none'],
    groomingFrequency: 2,
  });

  const totalSteps = 5;
  const costBreakdown = useMemo(() => calculateCosts(surveyData), [surveyData]);

  const districts: District[] = [
    '1st (Innere Stadt)', '2nd (Leopoldstadt)', '3rd (Landstraße)', 
    '4th (Wieden)', '5th (Margareten)', '6th (Mariahilf)', 
    '7th (Neubau)', '8th (Josefstadt)', '9th (Alsergrund)', 
    'Other (10-23)'
  ];

  const healthConditionOptions: { value: HealthCondition; label: string }[] = [
    { value: 'none', label: t.survey.noHealthIssues },
    { value: 'allergies', label: t.survey.allergies },
    { value: 'diabetes', label: t.survey.diabetes },
    { value: 'joint_problems', label: t.survey.jointProblems },
    { value: 'skin_conditions', label: t.survey.skinConditions },
    { value: 'digestive_issues', label: t.survey.digestiveIssues },
    { value: 'heart_conditions', label: t.survey.heartConditions },
    { value: 'dental_problems', label: t.survey.dentalProblems },
    { value: 'obesity', label: t.survey.obesity },
  ];

  const handleHealthConditionToggle = (condition: HealthCondition) => {
    setSurveyData(prev => {
      let newConditions = [...prev.healthConditions];
      
      if (condition === 'none') {
        return { ...prev, healthConditions: ['none'] };
      }
      
      newConditions = newConditions.filter(c => c !== 'none');
      
      if (newConditions.includes(condition)) {
        newConditions = newConditions.filter(c => c !== condition);
        if (newConditions.length === 0) {
          newConditions = ['none'];
        }
      } else {
        newConditions.push(condition);
      }
      
      return { ...prev, healthConditions: newConditions };
    });
  };

  const petAgeLabels: Record<PetAge, string> = {
    puppy_kitten: t.survey.puppyKitten,
    young: t.survey.young,
    adult: t.survey.adult,
    senior: t.survey.senior,
  };
  
  const vetFrequencyLabels: Record<VetFrequency, string> = {
    rarely: t.survey.rarely,
    once_year: t.survey.onceYear,
    twice_year: t.survey.twiceYear,
    quarterly: t.survey.quarterly,
    monthly: t.survey.monthly,
  };

  const planNames = {
    basic: lang === 'de' ? 'Der Basis' : 'The Basic',
    care_plus: lang === 'de' ? 'Der Care Plus' : 'The Care Plus',
    vip: lang === 'de' ? 'Der VIP' : 'The VIP',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://formspree.io/f/mvzrvyel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          district,
          language: lang,
          petType: surveyData.petType,
          petCount: surveyData.petCount,
          petAge: petAgeLabels[surveyData.petAge],
          vetFrequency: vetFrequencyLabels[surveyData.vetFrequency],
          healthConditions: surveyData.healthConditions.join(', '),
          groomingFrequency: surveyData.groomingFrequency + ' times/year',
          estimatedAnnualCost: '€' + costBreakdown.totalWithoutMembership,
          recommendedPlan: planNames[costBreakdown.recommendedPlan],
          estimatedSavings: '€' + costBreakdown.annualSavings + '/year',
          savingsPercentage: costBreakdown.savingsPercentage + '%',
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert(lang === 'de' ? 'Etwas ist schief gelaufen. Bitte versuche es erneut.' : 'Something went wrong. Please try again.');
      }
    } catch (error) {
      alert(lang === 'de' ? 'Etwas ist schief gelaufen. Bitte versuche es erneut.' : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSubmitted(false);
    setIsSubmitting(false);
    setEmail('');
    setSurveyData({
      petType: 'dog',
      petCount: 1,
      petAge: 'adult',
      vetFrequency: 'twice_year',
      healthConditions: ['none'],
      groomingFrequency: 2,
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  if (!isOpen) return null;

  const petTypeIcons = {
    dog: Dog,
    cat: Cat,
    rabbit: Rabbit,
    other: HelpCircle,
  };

  const petTypeLabels = {
    dog: t.survey.dog,
    cat: t.survey.cat,
    rabbit: t.survey.rabbit,
    other: t.survey.other,
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
          <X className="w-6 h-6" />
        </button>

        {!submitted && (
          <div className="px-4 sm:px-8 pt-6 sm:pt-8">
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div 
                  key={i} 
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i <= step ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center">{t.survey.step} {step} {t.survey.of} {totalSteps}</p>
          </div>
        )}

        <div className="p-4 sm:p-8">
          {/* Step 1: Pet Type & Count */}
          {step === 1 && !submitted && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-600 mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{t.survey.step1Title}</h3>
                <p className="text-slate-500 mt-2">{t.survey.step1Subtitle}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">{t.survey.petType}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['dog', 'cat', 'rabbit', 'other'] as PetType[]).map(type => {
                    const Icon = petTypeIcons[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSurveyData(prev => ({ ...prev, petType: type }))}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          surveyData.petType === type 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium capitalize">{petTypeLabels[type]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">{t.survey.howMany}</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setSurveyData(prev => ({ ...prev, petCount: Math.max(1, prev.petCount - 1) }))}
                    className="w-12 h-12 rounded-xl border-2 border-slate-200 hover:border-emerald-500 flex items-center justify-center text-xl font-bold text-slate-600"
                  >
                    -
                  </button>
                  <span className="text-3xl font-bold text-slate-900 w-12 text-center">{surveyData.petCount}</span>
                  <button
                    type="button"
                    onClick={() => setSurveyData(prev => ({ ...prev, petCount: Math.min(5, prev.petCount + 1) }))}
                    className="w-12 h-12 rounded-xl border-2 border-slate-200 hover:border-emerald-500 flex items-center justify-center text-xl font-bold text-slate-600"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">{t.survey.petAge}</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'puppy_kitten', label: t.survey.puppyKitten, desc: t.survey.years0_1 },
                    { value: 'young', label: t.survey.young, desc: t.survey.years1_3 },
                    { value: 'adult', label: t.survey.adult, desc: t.survey.years3_7 },
                    { value: 'senior', label: t.survey.senior, desc: t.survey.years7plus },
                  ].map(age => (
                    <button
                      key={age.value}
                      type="button"
                      onClick={() => setSurveyData(prev => ({ ...prev, petAge: age.value as PetAge }))}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        surveyData.petAge === age.value 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-semibold text-slate-900">{age.label}</span>
                      <span className="text-sm text-slate-500 block">{age.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                {t.survey.continue}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Vet Visits */}
          {step === 2 && !submitted && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-600 mb-4">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{t.survey.step2Title}</h3>
                <p className="text-slate-500 mt-2">{t.survey.step2Subtitle}</p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'rarely', label: t.survey.rarely, desc: t.survey.rarelyDesc },
                  { value: 'once_year', label: t.survey.onceYear, desc: t.survey.onceYearDesc },
                  { value: 'twice_year', label: t.survey.twiceYear, desc: t.survey.twiceYearDesc },
                  { value: 'quarterly', label: t.survey.quarterly, desc: t.survey.quarterlyDesc },
                  { value: 'monthly', label: t.survey.monthly, desc: t.survey.monthlyDesc },
                ].map(freq => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => setSurveyData(prev => ({ ...prev, vetFrequency: freq.value as VetFrequency }))}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                      surveyData.vetFrequency === freq.value 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Calendar className={`w-5 h-5 ${surveyData.vetFrequency === freq.value ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-semibold text-slate-900">{freq.label}</span>
                      <span className="text-sm text-slate-500 block">{freq.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  {t.survey.back}
                </button>
                <button 
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                >
                  {t.survey.continue}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Health Conditions */}
          {step === 3 && !submitted && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-600 mb-4">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{t.survey.step3Title}</h3>
                <p className="text-slate-500 mt-2">{t.survey.step3Subtitle}</p>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {healthConditionOptions.map(condition => (
                  <button
                    key={condition.value}
                    type="button"
                    onClick={() => handleHealthConditionToggle(condition.value)}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                      surveyData.healthConditions.includes(condition.value)
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                      surveyData.healthConditions.includes(condition.value)
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300'
                    }`}>
                      {surveyData.healthConditions.includes(condition.value) && (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-medium text-slate-700">{condition.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  {t.survey.back}
                </button>
                <button 
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                >
                  {t.survey.continue}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Grooming */}
          {step === 4 && !submitted && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-600 mb-4">
                  <Scissors className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{t.survey.step4Title}</h3>
                <p className="text-slate-500 mt-2">{t.survey.step4Subtitle}</p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 0, label: t.survey.never, desc: t.survey.neverDesc },
                  { value: 2, label: t.survey.occasional, desc: t.survey.occasionalDesc },
                  { value: 4, label: t.survey.seasonal, desc: t.survey.seasonalDesc },
                  { value: 6, label: t.survey.bimonthly, desc: t.survey.bimonthlyDesc },
                  { value: 12, label: t.survey.monthlyGrooming, desc: t.survey.monthlyGroomingDesc },
                ].map(freq => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => setSurveyData(prev => ({ ...prev, groomingFrequency: freq.value }))}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                      surveyData.groomingFrequency === freq.value 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Scissors className={`w-5 h-5 ${surveyData.groomingFrequency === freq.value ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-semibold text-slate-900">{freq.label}</span>
                      <span className="text-sm text-slate-500 block">{freq.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  {t.survey.back}
                </button>
                <button 
                  type="button"
                  onClick={() => setStep(5)}
                  className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                >
                  {t.survey.seeSavings}
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Results & Email */}
          {step === 5 && !submitted && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-600 mb-4">
                  <PiggyBank className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{t.survey.step5Title}</h3>
                <p className="text-slate-500 mt-2">{t.survey.step5Subtitle}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{t.survey.estimatedCosts}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t.survey.vetCheckups}</span>
                    <span className="font-semibold text-slate-900">€{costBreakdown.annualCheckups}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t.survey.vaccinations}</span>
                    <span className="font-semibold text-slate-900">€{costBreakdown.vaccinations}</span>
                  </div>
                  {costBreakdown.healthConditionCosts > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t.survey.healthConditionCare}</span>
                      <span className="font-semibold text-slate-900">€{costBreakdown.healthConditionCosts}</span>
                    </div>
                  )}
                  {costBreakdown.grooming > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t.survey.professionalGrooming}</span>
                      <span className="font-semibold text-slate-900">€{costBreakdown.grooming}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t.survey.emergencyBuffer}</span>
                    <span className="font-semibold text-slate-900">€{costBreakdown.emergencyBuffer}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">{t.survey.totalWithout}</span>
                      <span className="font-bold text-slate-900">€{costBreakdown.totalWithoutMembership}/{t.survey.year}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingDown className="w-6 h-6" />
                  <span className="font-bold">{t.survey.withPlan} {planNames[costBreakdown.recommendedPlan]}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">{t.survey.couldSave}</p>
                    <p className="text-4xl font-black">€{costBreakdown.annualSavings}</p>
                    <p className="text-emerald-100 text-sm">{t.survey.perYear} ({costBreakdown.savingsPercentage}% {t.survey.savings})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-100 text-sm">{t.survey.only}</p>
                    <p className="text-2xl font-bold">€{PLAN_PRICES[costBreakdown.recommendedPlan]}/{lang === 'de' ? 'Monat' : 'mo'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4">
                <h4 className="font-bold text-emerald-800 text-sm mb-2">{t.survey.whatsIncluded}</h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {t.survey.vaccinationsCovered}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {costBreakdown.recommendedPlan === 'basic' ? '1' : '2'} {costBreakdown.recommendedPlan === 'basic' ? t.survey.annualCheck : t.survey.annualChecks}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {costBreakdown.recommendedPlan === 'basic' ? '5%' : costBreakdown.recommendedPlan === 'care_plus' ? '10%' : '20%'} {t.survey.offPartner}
                  </li>
                  {costBreakdown.recommendedPlan === 'vip' && (
                    <>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span><strong>{t.survey.groomingSessions}</strong> (€240+ {lang === 'de' ? 'Wert' : 'value'}!)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span><strong>{t.survey.teethCleaning}</strong> (€175 {lang === 'de' ? 'Wert' : 'value'})</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-emerald-600 font-medium">{t.survey.morePerks}</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 text-amber-600 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-800 text-sm">{t.survey.referTitle}</h4>
                    <p className="text-amber-700 text-xs mt-1">
                      {t.survey.referDesc} <strong>{t.survey.referBonus}</strong> {t.survey.referEnd}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t.survey.district}</label>
                  <select 
                    value={district}
                    onChange={(e) => setDistrict(e.target.value as District)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  >
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t.survey.email}</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.at"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {lang === 'de' ? 'Wird gesendet...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      {t.survey.joinAndSave} €{costBreakdown.annualSavings}/{t.survey.year}
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <button 
                type="button"
                onClick={() => setStep(4)}
                className="w-full text-slate-500 font-medium py-2 hover:text-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {t.survey.goBack}
              </button>
            </div>
          )}

          {/* Success state */}
          {submitted && (
            <div className="text-center space-y-6 py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full text-emerald-600 mb-2">
                <Star className="w-10 h-10 fill-current" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900">{t.survey.youreIn}</h3>
              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-2xl p-5">
                  <p className="text-lg font-medium text-slate-600">
                    {t.survey.personalizedSavings}
                  </p>
                  <p className="text-4xl font-black text-emerald-600 my-2">
                    €{costBreakdown.annualSavings}/{t.survey.year}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t.survey.withPlanName} {planNames[costBreakdown.recommendedPlan]} {t.survey.plan}
                  </p>
                </div>
                <p className="text-slate-500">
                  {t.survey.addedToWaitlist} <span className="text-emerald-600 font-bold">{district}</span>. 
                  {' '}{t.survey.voucher} <strong className="text-slate-900">{t.survey.voucherAmount}</strong> {t.survey.voucherEnd}
                </p>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                    <h4 className="font-bold text-amber-800">{t.survey.wantFreeMonth}</h4>
                  </div>
                  <p className="text-amber-700 text-sm mb-3">
                    {t.survey.referFriend} <strong>{t.survey.bothGetFree}</strong> {t.survey.onceLaunch}
                  </p>
                  <p className="text-xs text-amber-600">
                    {t.survey.shareWith}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="w-full border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all"
              >
                {t.survey.close}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Sticky Mobile CTA ---

const StickyMobileCTA: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <button
        onClick={onOpenModal}
        className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
      >
        {t.nav.joinClub}
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  
  const t = translations[lang];

  const plans = [
    {
      name: t.pricing.basic.name,
      price: "19",
      description: t.pricing.basic.description,
      features: t.pricing.basic.features
    },
    {
      name: t.pricing.carePlus.name,
      price: "39",
      description: t.pricing.carePlus.description,
      features: t.pricing.carePlus.features,
      isPopular: true
    },
    {
      name: t.pricing.vip.name,
      price: "99",
      description: t.pricing.vip.description,
      features: t.pricing.vip.features
    }
  ];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="min-h-screen selection:bg-emerald-200">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm uppercase tracking-wider">
                  <Star className="w-4 h-4 fill-current" />
                  {t.hero.badge}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 leading-tight">
                  {t.hero.title1} <br />
                  <span className="text-emerald-600">{t.hero.title2}</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-xl mx-auto lg:mx-0">
                  {t.hero.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a 
                    href="#plans" 
                    className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 text-center"
                  >
                    {t.hero.seePlans}
                  </a>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:border-emerald-500 hover:text-emerald-600 transition-all text-center"
                  >
                    {t.hero.joinWaitlist}
                  </button>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-3 text-sm font-medium">
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                    <span className="text-amber-700 font-semibold">{t.hero.joinedBy}</span>
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-4 bg-emerald-600/10 rounded-3xl blur-2xl group-hover:bg-emerald-600/20 transition-all duration-500" />
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-4 sm:border-8 border-white">
                  <img 
                    src="/hero-dog.png" 
                    alt="Happy dog playing with owner in Vienna" 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg flex items-center gap-4 border border-white/50">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{t.hero.foundingStatus}</p>
                      <div className="w-32 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div className="w-3/4 h-full bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                    <span className="ml-auto text-sm font-bold text-emerald-600">75% {t.hero.full}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
                {t.problem.title1} <span className="text-emerald-400">{t.problem.title2}</span> {t.problem.title3}
              </h2>
              <p className="text-xl text-slate-400">
                {t.problem.subtitle} <strong className="text-white">{t.problem.annually}</strong> {t.problem.subtitle2}
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-12">
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t.problem.preventiveCare}</h3>
                  <p className="text-slate-400 text-sm">{t.problem.preventiveDesc}</p>
                </div>
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t.problem.groomingPerks}</h3>
                  <p className="text-slate-400 text-sm">{t.problem.groomingDesc}</p>
                </div>
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t.problem.localDiscounts}</h3>
                  <p className="text-slate-400 text-sm">{t.problem.localDesc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">{t.howItWorks.title}</h2>
              <p className="text-slate-500 text-lg">{t.howItWorks.subtitle}</p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
              {[
                { 
                  step: "01", 
                  title: t.howItWorks.step1Title, 
                  desc: t.howItWorks.step1Desc,
                  icon: <Heart className="w-8 h-8 text-emerald-600" />
                },
                { 
                  step: "02", 
                  title: t.howItWorks.step2Title, 
                  desc: t.howItWorks.step2Desc,
                  icon: <MapPin className="w-8 h-8 text-emerald-600" />
                },
                { 
                  step: "03", 
                  title: t.howItWorks.step3Title, 
                  desc: t.howItWorks.step3Desc,
                  icon: <CreditCard className="w-8 h-8 text-emerald-600" />
                }
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="bg-slate-50 rounded-[2.5rem] p-10 h-full border-2 border-transparent group-hover:border-emerald-100 group-hover:bg-white transition-all shadow-sm hover:shadow-xl">
                    <span className="text-5xl sm:text-7xl font-black text-slate-200 group-hover:text-emerald-50/50 transition-colors absolute top-4 right-8 select-none">{item.step}</span>
                    <div className="relative">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-8 border border-slate-100">
                        {item.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  {idx < 2 && (
                    <div className="hidden lg:block absolute top-1/2 -right-6 -translate-y-1/2 z-10">
                      <ChevronRight className="w-12 h-12 text-slate-200" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="plans" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">{t.pricing.title1} <br/><span className="text-emerald-600">{t.pricing.title2}</span></h2>
              <p className="text-slate-500 text-lg">{t.pricing.subtitle}</p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {plans.map((plan, idx) => (
                <div 
                  key={idx} 
                  className={`relative flex flex-col bg-white rounded-[2rem] p-8 border-2 ${plan.isPopular ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-white'} shadow-xl transition-transform hover:-translate-y-2 duration-300`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      {t.pricing.mostPopular}
                    </div>
                  )}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-slate-500 text-sm h-10">{plan.description}</p>
                  </div>
                  <div className="mb-8">
                    <span className="text-5xl font-black text-slate-900">€{plan.price}</span>
                    <span className="text-slate-500 font-medium">{t.pricing.perMonth}</span>
                  </div>
                  <ul className="space-y-4 mb-12 flex-grow">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-slate-600 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                      plan.isPopular 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200' 
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {plan.isPopular ? t.pricing.getStarted : t.pricing.joinNow}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-center mt-12 text-slate-400 font-medium">
              {t.pricing.riskFree}
            </p>
          </div>
        </section>

        {/* Partners Section */}
        <section id="partners" className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                  {t.partners.title1} <br/>
                  <span className="text-emerald-600">{t.partners.title2}</span>
                </h2>
                <p className="text-lg text-slate-600">
                  {t.partners.subtitle}
                </p>
                <div className="space-y-6">
                  {[
                    { title: t.partners.vets, icon: <ShieldCheck /> },
                    { title: t.partners.grooming, icon: <Scissors /> },
                    { title: t.partners.boutiques, icon: <Heart /> }
                  ].map((cat, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                        {cat.icon}
                      </div>
                      <span className="font-bold text-slate-800">{cat.title}</span>
                      <ChevronRight className="ml-auto w-5 h-5 text-slate-400" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-emerald-600 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-bold">{t.partners.transparency}</h4>
                    <p className="text-emerald-100 text-sm">{t.partners.transparencyDesc}</p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-4 sm:mt-12">
                     <div className="h-48 sm:h-56 lg:h-64 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                       <img src="https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?q=80&w=1976&auto=format&fit=crop" className="w-full h-full object-cover" alt="Happy dog in Vienna - affordable pet healthcare" />
                     </div>
                     <div className="h-36 sm:h-40 lg:h-48 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                       <img src="https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=1974&auto=format&fit=crop" className="w-full h-full object-cover" alt="Cat veterinary care Vienna - vaccinations included" />
                     </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-36 sm:h-40 lg:h-48 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                       <img src="/french-bulldog.png" className="w-full h-full object-cover" alt="French bulldog sleeping - pet healthcare Vienna" />
                     </div>
                     <div className="h-48 sm:h-56 lg:h-64 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                       <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop" className="w-full h-full object-cover" alt="Dogs playing in Vienna park - pet healthcare membership" />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lead Capture Section */}
        <section id="waitlist" className="py-24 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-emerald-600 rounded-2xl sm:rounded-[3rem] p-6 sm:p-8 md:p-12 lg:p-20 relative overflow-hidden text-center text-white shadow-2xl shadow-emerald-200">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
              
              <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full font-bold text-sm tracking-widest uppercase">
                  {t.waitlist.badge}
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
                  {t.waitlist.title}
                </h2>
                <p className="text-xl text-emerald-100">
                  {t.waitlist.subtitle} <strong className="text-white underline underline-offset-4">{t.waitlist.freeMonth}</strong>
                </p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-emerald-600 px-12 py-5 rounded-2xl font-black text-xl hover:bg-emerald-50 transition-all shadow-xl inline-flex items-center gap-2 group"
                >
                  {t.waitlist.joinButton}
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                  <div className="flex items-center justify-center gap-3">
                    <Star className="w-6 h-6 text-amber-300 fill-current" />
                    <p className="text-lg font-bold">
                      {t.waitlist.referral} <span className="text-amber-300">{t.waitlist.referralBonus}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-12 pb-24 md:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Pet Pass Vienna" className="w-8 h-8 rounded-lg" />
                <span className="text-lg font-extrabold text-slate-900 tracking-tight">Pet Pass Vienna</span>
              </div>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-slate-500 font-medium text-sm">
                <a href="#" className="hover:text-emerald-600">{t.footer.privacy}</a>
                <a href="#" className="hover:text-emerald-600">{t.footer.terms}</a>
                <a href="#" className="hover:text-emerald-600">{t.footer.impressum}</a>
                <a href="#" className="hover:text-emerald-600">{t.footer.contact}</a>
              </div>
              <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/petpassvienna?igsh=d3pxZTczcjRoYm80" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-100 rounded-full hover:bg-emerald-100 hover:text-emerald-600 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
              {t.footer.copyright}
            </div>
          </div>
        </footer>

        {/* Sticky Mobile CTA */}
        <StickyMobileCTA onOpenModal={() => setIsModalOpen(true)} />

        {/* Survey Modal */}
        <WaitlistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </LanguageContext.Provider>
  );
}
