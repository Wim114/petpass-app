import React, { useState, useMemo } from 'react';
import {
  Heart, Stethoscope, Scissors, CheckCircle2, Star, ChevronRight, ChevronLeft,
  Dog, Cat, Rabbit, HelpCircle, Calendar, Activity, TrendingDown, Sparkles, PiggyBank, X
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { calculateCosts } from '@/lib/utils';
import { PLAN_PRICES, DISTRICTS } from '@/lib/constants';
import type { PetSurveyData, District, PetType, PetAge, VetFrequency, HealthCondition } from '@/types';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SurveyModal: React.FC<SurveyModalProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useLanguage();
  const [flowType, setFlowType] = useState<'quick' | 'survey'>('quick');
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

  const districts: District[] = DISTRICTS;

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
        if (newConditions.length === 0) newConditions = ['none'];
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

    const payload = flowType === 'quick'
      ? { email, district, language: lang, source: 'quick_join' }
      : {
          email, district, language: lang, source: 'survey',
          petType: surveyData.petType, petCount: surveyData.petCount,
          petAge: petAgeLabels[surveyData.petAge],
          vetFrequency: vetFrequencyLabels[surveyData.vetFrequency],
          healthConditions: surveyData.healthConditions.join(', '),
          groomingFrequency: surveyData.groomingFrequency + ' times/year',
          estimatedAnnualCost: '€' + costBreakdown.totalWithoutMembership,
          recommendedPlan: planNames[costBreakdown.recommendedPlan],
          estimatedSavings: '€' + costBreakdown.annualSavings + '/year',
          savingsPercentage: costBreakdown.savingsPercentage + '%',
        };

    try {
      const response = await fetch('https://formspree.io/f/mvzrvyel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        alert(lang === 'de' ? 'Etwas ist schief gelaufen. Bitte versuche es erneut.' : 'Something went wrong. Please try again.');
      }
    } catch {
      alert(lang === 'de' ? 'Etwas ist schief gelaufen. Bitte versuche es erneut.' : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setFlowType('quick');
    setStep(1);
    setSubmitted(false);
    setIsSubmitting(false);
    setEmail('');
    setSurveyData({
      petType: 'dog', petCount: 1, petAge: 'adult',
      vetFrequency: 'twice_year', healthConditions: ['none'], groomingFrequency: 2,
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  if (!isOpen) return null;

  const petTypeIcons = { dog: Dog, cat: Cat, rabbit: Rabbit, other: HelpCircle };
  const petTypeLabels = { dog: t.survey.dog, cat: t.survey.cat, rabbit: t.survey.rabbit, other: t.survey.other };

  const SubmitSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
          <X className="w-6 h-6" />
        </button>

        {!submitted && flowType === 'survey' && (
          <div className="px-4 sm:px-8 pt-6 sm:pt-8">
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center">{t.survey.step} {step} {t.survey.of} {totalSteps}</p>
          </div>
        )}

        <div className="p-4 sm:p-8">
          {/* Quick Join Flow */}
          {flowType === 'quick' && !submitted && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-600 mb-4">
                  <Star className="w-8 h-8 fill-current" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{t.survey.quickJoinTitle}</h3>
                <p className="text-slate-500 mt-2">{t.survey.quickJoinSubtitle}</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t.survey.district}</label>
                  <select value={district} onChange={(e) => setDistrict(e.target.value as District)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition-all outline-none">
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t.survey.email}</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.at" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? (<><SubmitSpinner />{lang === 'de' ? 'Wird gesendet...' : 'Submitting...'}</>) : (<>{t.survey.reserveSpot}<ChevronRight className="w-5 h-5" /></>)}
                </button>
              </form>
              <div className="text-center">
                <button type="button" onClick={() => { setFlowType('survey'); setStep(1); }} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm underline underline-offset-4 transition-colors">
                  {t.survey.orCalculateSavings}
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Pet Type & Count */}
          {flowType === 'survey' && step === 1 && !submitted && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-600 mb-4"><Heart className="w-8 h-8" /></div>
                <h3 className="text-2xl font-bold text-slate-900">{t.survey.step1Title}</h3>
                <p className="text-slate-500 mt-2">{t.survey.step1Subtitle}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">{t.survey.petType}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['dog', 'cat', 'rabbit', 'other'] as PetType[]).map(type => {
                    const Icon = petTypeIcons[type];
                    return (
                      <button key={type} type="button" onClick={() => setSurveyData(prev => ({ ...prev, petType: type }))} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${surveyData.petType === type ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}>
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
                  <button type="button" onClick={() => setSurveyData(prev => ({ ...prev, petCount: Math.max(1, prev.petCount - 1) }))} className="w-12 h-12 rounded-xl border-2 border-slate-200 hover:border-emerald-500 flex items-center justify-center text-xl font-bold text-slate-600">-</button>
                  <span className="text-3xl font-bold text-slate-900 w-12 text-center">{surveyData.petCount}</span>
                  <button type="button" onClick={() => setSurveyData(prev => ({ ...prev, petCount: Math.min(5, prev.petCount + 1) }))} className="w-12 h-12 rounded-xl border-2 border-slate-200 hover:border-emerald-500 flex items-center justify-center text-xl font-bold text-slate-600">+</button>
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
                    <button key={age.value} type="button" onClick={() => setSurveyData(prev => ({ ...prev, petAge: age.value as PetAge }))} className={`p-4 rounded-xl border-2 transition-all text-left ${surveyData.petAge === age.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <span className="font-semibold text-slate-900">{age.label}</span>
                      <span className="text-sm text-slate-500 block">{age.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => setStep(2)} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
                {t.survey.continue}<ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Vet Visits */}
          {flowType === 'survey' && step === 2 && !submitted && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-600 mb-4"><Stethoscope className="w-8 h-8" /></div>
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
                  <button key={freq.value} type="button" onClick={() => setSurveyData(prev => ({ ...prev, vetFrequency: freq.value as VetFrequency }))} className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${surveyData.vetFrequency === freq.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <Calendar className={`w-5 h-5 ${surveyData.vetFrequency === freq.value ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-semibold text-slate-900">{freq.label}</span>
                      <span className="text-sm text-slate-500 block">{freq.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"><ChevronLeft className="w-5 h-5" />{t.survey.back}</button>
                <button type="button" onClick={() => setStep(3)} className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">{t.survey.continue}<ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          )}

          {/* Step 3: Health Conditions */}
          {flowType === 'survey' && step === 3 && !submitted && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-600 mb-4"><Activity className="w-8 h-8" /></div>
                <h3 className="text-2xl font-bold text-slate-900">{t.survey.step3Title}</h3>
                <p className="text-slate-500 mt-2">{t.survey.step3Subtitle}</p>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {healthConditionOptions.map(condition => (
                  <button key={condition.value} type="button" onClick={() => handleHealthConditionToggle(condition.value)} className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${surveyData.healthConditions.includes(condition.value) ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${surveyData.healthConditions.includes(condition.value) ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                      {surveyData.healthConditions.includes(condition.value) && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className="font-medium text-slate-700">{condition.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"><ChevronLeft className="w-5 h-5" />{t.survey.back}</button>
                <button type="button" onClick={() => setStep(4)} className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">{t.survey.continue}<ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          )}

          {/* Step 4: Grooming */}
          {flowType === 'survey' && step === 4 && !submitted && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-600 mb-4"><Scissors className="w-8 h-8" /></div>
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
                  <button key={freq.value} type="button" onClick={() => setSurveyData(prev => ({ ...prev, groomingFrequency: freq.value }))} className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${surveyData.groomingFrequency === freq.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <Scissors className={`w-5 h-5 ${surveyData.groomingFrequency === freq.value ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-semibold text-slate-900">{freq.label}</span>
                      <span className="text-sm text-slate-500 block">{freq.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(3)} className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"><ChevronLeft className="w-5 h-5" />{t.survey.back}</button>
                <button type="button" onClick={() => setStep(5)} className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">{t.survey.seeSavings}<Sparkles className="w-5 h-5" /></button>
              </div>
            </div>
          )}

          {/* Step 5: Results & Email */}
          {flowType === 'survey' && step === 5 && !submitted && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-600 mb-4"><PiggyBank className="w-8 h-8" /></div>
                <h3 className="text-2xl font-bold text-slate-900">{t.survey.step5Title}</h3>
                <p className="text-slate-500 mt-2">{t.survey.step5Subtitle}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{t.survey.estimatedCosts}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600">{t.survey.vetCheckups}</span><span className="font-semibold text-slate-900">€{costBreakdown.annualCheckups}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">{t.survey.vaccinations}</span><span className="font-semibold text-slate-900">€{costBreakdown.vaccinations}</span></div>
                  {costBreakdown.healthConditionCosts > 0 && <div className="flex justify-between"><span className="text-slate-600">{t.survey.healthConditionCare}</span><span className="font-semibold text-slate-900">€{costBreakdown.healthConditionCosts}</span></div>}
                  {costBreakdown.grooming > 0 && <div className="flex justify-between"><span className="text-slate-600">{t.survey.professionalGrooming}</span><span className="font-semibold text-slate-900">€{costBreakdown.grooming}</span></div>}
                  <div className="flex justify-between"><span className="text-slate-600">{t.survey.emergencyBuffer}</span><span className="font-semibold text-slate-900">€{costBreakdown.emergencyBuffer}</span></div>
                  <div className="border-t border-slate-200 pt-2 mt-2"><div className="flex justify-between"><span className="font-bold text-slate-900">{t.survey.totalWithout}</span><span className="font-bold text-slate-900">€{costBreakdown.totalWithoutMembership}/{t.survey.year}</span></div></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-4"><TrendingDown className="w-6 h-6" /><span className="font-bold">{t.survey.withPlan} {planNames[costBreakdown.recommendedPlan]}</span></div>
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
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{t.survey.vaccinationsCovered}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{costBreakdown.recommendedPlan === 'basic' ? '1' : '2'} {costBreakdown.recommendedPlan === 'basic' ? t.survey.annualCheck : t.survey.annualChecks}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{costBreakdown.recommendedPlan === 'basic' ? '5%' : costBreakdown.recommendedPlan === 'care_plus' ? '10%' : '20%'} {t.survey.offPartner}</li>
                  {costBreakdown.recommendedPlan === 'vip' && (
                    <>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /><span><strong>{t.survey.groomingSessions}</strong> (€240+ {lang === 'de' ? 'Wert' : 'value'}!)</span></li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /><span><strong>{t.survey.teethCleaning}</strong> (€175 {lang === 'de' ? 'Wert' : 'value'})</span></li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /><span className="text-emerald-600 font-medium">{t.survey.morePerks}</span></li>
                    </>
                  )}
                </ul>
              </div>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0"><Star className="w-4 h-4 text-amber-600 fill-current" /></div>
                  <div>
                    <h4 className="font-bold text-amber-800 text-sm">{t.survey.referTitle}</h4>
                    <p className="text-amber-700 text-xs mt-1">{t.survey.referDesc} <strong>{t.survey.referBonus}</strong> {t.survey.referEnd}</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t.survey.district}</label>
                  <select value={district} onChange={(e) => setDistrict(e.target.value as District)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition-all outline-none">
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t.survey.email}</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.at" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? (<><SubmitSpinner />{lang === 'de' ? 'Wird gesendet...' : 'Submitting...'}</>) : (<>{t.survey.joinAndSave} €{costBreakdown.annualSavings}/{t.survey.year}<ChevronRight className="w-5 h-5" /></>)}
                </button>
              </form>
              <button type="button" onClick={() => setStep(4)} className="w-full text-slate-500 font-medium py-2 hover:text-slate-700 transition-all flex items-center justify-center gap-2"><ChevronLeft className="w-4 h-4" />{t.survey.goBack}</button>
            </div>
          )}

          {/* Success state */}
          {submitted && (
            <div className="text-center space-y-6 py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full text-emerald-600 mb-2"><Star className="w-10 h-10 fill-current" /></div>
              <h3 className="text-3xl font-extrabold text-slate-900">{t.survey.youreIn}</h3>
              <div className="space-y-4">
                {flowType === 'survey' ? (
                  <div className="bg-emerald-50 rounded-2xl p-5">
                    <p className="text-lg font-medium text-slate-600">{t.survey.personalizedSavings}</p>
                    <p className="text-4xl font-black text-emerald-600 my-2">€{costBreakdown.annualSavings}/{t.survey.year}</p>
                    <p className="text-sm text-slate-500">{t.survey.withPlanName} {planNames[costBreakdown.recommendedPlan]} {t.survey.plan}</p>
                  </div>
                ) : (
                  <div className="bg-emerald-50 rounded-2xl p-5"><p className="text-lg font-medium text-slate-700">{t.survey.quickSuccessMessage}</p></div>
                )}
                <p className="text-slate-500">{t.survey.addedToWaitlist} <span className="text-emerald-600 font-bold">{district}</span>.{' '}{t.survey.voucher} <strong className="text-slate-900">{t.survey.voucherAmount}</strong> {t.survey.voucherEnd}</p>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 text-left">
                  <div className="flex items-center gap-2 mb-2"><Star className="w-5 h-5 text-amber-500 fill-current" /><h4 className="font-bold text-amber-800">{t.survey.wantFreeMonth}</h4></div>
                  <p className="text-amber-700 text-sm mb-3">{t.survey.referFriend} <strong>{t.survey.bothGetFree}</strong> {t.survey.onceLaunch}</p>
                  <p className="text-xs text-amber-600">{t.survey.shareWith}</p>
                </div>
              </div>
              <button onClick={handleClose} className="w-full border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all">{t.survey.close}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyModal;
