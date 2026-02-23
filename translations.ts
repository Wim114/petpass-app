export type Language = 'en' | 'de';

export const translations = {
  en: {
    // Navbar
    nav: {
      howItWorks: 'How it Works',
      plans: 'Plans',
      partners: 'Partners',
      faq: 'FAQ',
      joinClub: 'Join the Club',
    },

    // Hero Section
    hero: {
      badge: 'First Month Free for Early Adopters',
      title1: 'Happy Pets,',
      title2: 'Healthy Wallets.',
      subtitle: 'The affordable pet healthcare membership for Vienna. One monthly fee covers vet checkups, vaccinations, grooming, and local discounts. Save €400+ per year on vet costs.',
      seePlans: 'See Membership Plans',
      joinWaitlist: 'Join the Waitlist',
      joinedBy: 'Only 100 spots available this month — claim yours!',
      foundingStatus: 'Founding 100 Status',
      spotsLeft: 'Only {n} spots left!',
      full: 'Full',
    },

    // Problem/Solution Section
    problem: {
      title1: 'Stop Paying',
      title2: '"Surprise"',
      title3: 'Vet Bills.',
      subtitle: 'Vet costs in Vienna add up fast. A single checkup costs €40, vaccinations €110+, and grooming €60+ per session. Most pet owners spend',
      annually: '€400+ annually',
      subtitle2: 'on routine care. We bundle it into an affordable monthly subscription so your pet is always covered.',
      preventiveCare: 'Preventive Care',
      preventiveDesc: 'Dog and cat vaccinations in Vienna covered. Annual health checkups included at no extra cost.',
      groomingPerks: 'Grooming Perks',
      groomingDesc: 'Professional pet grooming in Vienna included. Keep your dog or cat looking sharp without the high prices.',
      localDiscounts: 'Local Discounts',
      localDesc: "Exclusive discounts at Vienna's best pet shops, veterinary clinics, and grooming salons across all districts.",
    },

    // How it Works
    howItWorks: {
      title: 'How It Works',
      subtitle: "Getting the best for your pet is as easy as 1-2-3.",
      step1Title: 'Join the Club',
      step1Desc: "Choose the plan that fits your pet's lifestyle.",
      step2Title: 'Visit Any Partner',
      step2Desc: 'Go to our curated network of top-rated Vienna vets and groomers.',
      step3Title: 'Flash Your Card',
      step3Desc: 'No payment at the desk. We handle the bill; you just give the treats.',
    },

    // Pricing
    pricing: {
      title1: 'Simple Pricing,',
      title2: 'No Surprises.',
      subtitle: 'Select a plan to start your membership.',
      mostPopular: 'MOST POPULAR',
      perMonth: '/mo',
      getStarted: 'Get Started',
      joinNow: 'Join Now',
      riskFree: 'Risk-free. Cancel anytime. First month is on us.',

      basic: {
        name: 'The Basic',
        description: 'Essential preventive care for healthy companions.',
        features: [
          'Yearly Vaccinations',
          '2x Annual Health Check',
          '10% Off Partner Vets',
          'Digital Membership Card',
        ],
      },
      carePlus: {
        name: 'The Care Plus',
        description: 'Comprehensive coverage with grooming perks.',
        features: [
          'Yearly Vaccinations',
          '3x Annual Health Checks',
          '15% Off All Treatments',
          '15% Off at Partner Shops',
          'Priority Customer Support',
        ],
      },
      vip: {
        name: 'The VIP',
        description: 'Premium care with grooming included — saves €400+/year.',
        features: [
          'Everything in Care Plus',
          '4x Annual Health Checks',
          '4x Professional Grooming sessions (€240+ value)',
          '1x Professional Teeth Cleaning (€175 value)',
          '25% Off at Partner Shops',
          '24/7 Priority Chat',
          'VIP Event Access',
          'More perks as our network grows!',
        ],
      },
    },

    // Trust Badges
    trust: {
      guarantee: 'Risk-Free Guarantee',
      guaranteeDesc: 'Not satisfied? Get a full refund within the first 30 days, no questions asked.',
      noCommitment: 'Cancel Anytime',
      noCommitmentDesc: 'No contracts, no lock-in periods. Cancel your membership whenever you want.',
      freeMonth: 'First Month Free',
      freeMonthDesc: 'Try Pet Pass Vienna completely free. No credit card required to join the waitlist.',
    },

    // Partners
    partners: {
      title1: 'Our Growing Vienna',
      title2: 'Ecosystem',
      subtitle: "We're building a network of premium partners to ensure your pet gets the best care in every district of Vienna.",
      vets: 'Top Vets in Districts 1-22',
      grooming: 'Premium Grooming Salons',
      boutiques: 'Local Organic Pet Boutiques',
      transparency: '100% Transparency',
      transparencyDesc: 'Designed specifically for Vienna Pet Owners.',
    },

    // FAQ
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about Pet Pass Vienna.',
      q1: 'What is Pet Pass Vienna exactly?',
      a1: 'Pet Pass Vienna is a monthly pet healthcare membership. Instead of paying for individual vet visits, vaccinations, and grooming sessions separately, you pay one predictable monthly fee that covers preventive care at our partner locations across Vienna.',
      q2: 'Can I cancel anytime?',
      a2: 'Yes, absolutely. There are no long-term contracts. You can cancel your membership at any time with no cancellation fees. Your first month is completely free, so you can try it risk-free.',
      q3: 'How much can I really save?',
      a3: 'Most pet owners in Vienna spend €400-800+ per year on routine vet care, vaccinations, and grooming. Depending on your plan, you can save 20-40% on these costs. Use our savings calculator to get your personalized estimate.',
      q4: 'Which vets and groomers are included?',
      a4: 'We are building a curated network of top-rated veterinary clinics and grooming salons across Vienna districts 1-9 (expanding to all districts soon). All partners are vetted for quality and customer satisfaction.',
      q5: 'When does Pet Pass Vienna launch?',
      a5: 'We are launching soon in districts 1-9. Join the Founding 100 waitlist to get early access, your first month free, and a €20 welcome voucher.',
      q6: 'Is this pet insurance?',
      a6: 'No. Pet Pass Vienna is a healthcare membership, not insurance. Unlike insurance, there are no claims to file, no deductibles, and no waiting periods. You simply visit a partner vet or groomer, show your digital membership card, and we handle the rest.',
    },

    // Waitlist Section
    waitlist: {
      badge: 'Limited Availability',
      title: 'Secure Your Spot in the Founding 100',
      subtitle: 'We are launching in District 1-9 first. Join the waitlist today and get your',
      freeMonth: 'first month completely free.',
      joinButton: 'Join the Waitlist',
      referral: 'Refer a friend →',
      referralBonus: 'Both get 1 month FREE!',
    },

    // Sticky CTA
    stickyCta: {
      joinNow: 'Join the Waitlist — First Month Free',
    },

    // Footer
    footer: {
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      impressum: 'Impressum',
      contact: 'Contact',
      copyright: '© 2024 Pet Pass Vienna. All rights reserved. Designed with love for Vienna\'s pets.',
    },

    // Survey Modal
    survey: {
      step: 'Step',
      of: 'of',

      // Quick Join
      quickJoinTitle: 'Join the Founding 100',
      quickJoinSubtitle: 'Be among the first to save on pet healthcare in Vienna.',
      reserveSpot: 'Reserve My Spot',
      orCalculateSavings: 'Want to see your personalized savings? Take the 2-min quiz →',
      quickSuccessMessage: "You're on the list! We'll send you a €20 voucher and early access details when we launch.",

      // Step 1
      step1Title: 'Tell us about your pet',
      step1Subtitle: "Let's find the perfect plan for your furry friend",
      petType: 'What type of pet do you have?',
      dog: 'dog',
      cat: 'cat',
      rabbit: 'rabbit',
      other: 'other',
      howMany: 'How many pets?',
      petAge: "Pet's age",
      puppyKitten: 'Puppy/Kitten',
      young: 'Young',
      adult: 'Adult',
      senior: 'Senior',
      years0_1: '0-1 years',
      years1_3: '1-3 years',
      years3_7: '3-7 years',
      years7plus: '7+ years',
      continue: 'Continue',
      back: 'Back',

      // Step 2
      step2Title: 'Veterinary visits',
      step2Subtitle: 'How often do you typically visit the vet?',
      rarely: 'Rarely',
      rarelyDesc: 'Only when something is wrong',
      onceYear: 'Once a year',
      onceYearDesc: 'Annual checkup',
      twiceYear: 'Twice a year',
      twiceYearDesc: 'Semi-annual visits',
      quarterly: 'Every 3 months',
      quarterlyDesc: 'Regular monitoring',
      monthly: 'Monthly',
      monthlyDesc: 'Ongoing treatment',

      // Step 3
      step3Title: 'Health conditions',
      step3Subtitle: 'Select any health issues your pet may have',
      noHealthIssues: 'No health issues',
      allergies: 'Allergies',
      diabetes: 'Diabetes',
      jointProblems: 'Joint problems / Arthritis',
      skinConditions: 'Skin conditions',
      digestiveIssues: 'Digestive issues',
      heartConditions: 'Heart conditions',
      dentalProblems: 'Dental problems',
      obesity: 'Obesity / Weight issues',

      // Step 4
      step4Title: 'Grooming needs',
      step4Subtitle: 'How often do you use professional grooming?',
      never: 'Never',
      neverDesc: 'I groom at home',
      occasional: '1-2 times a year',
      occasionalDesc: 'Occasional visits',
      seasonal: '3-4 times a year',
      seasonalDesc: 'Every season',
      bimonthly: '5-6 times a year',
      bimonthlyDesc: 'Every other month',
      monthlyGrooming: 'Monthly',
      monthlyGroomingDesc: 'Regular maintenance',
      seeSavings: 'See my savings',

      // Step 5
      step5Title: 'Your potential savings',
      step5Subtitle: 'Based on Vienna veterinary prices',
      estimatedCosts: 'Your estimated annual costs',
      vetCheckups: 'Vet checkups',
      vaccinations: 'Vaccinations',
      healthConditionCare: 'Health condition care',
      professionalGrooming: 'Professional grooming',
      emergencyBuffer: 'Emergency buffer (15%)',
      totalWithout: 'Total without membership',
      year: 'year',
      withPlan: 'With',
      couldSave: 'You could save up to',
      perYear: 'per year',
      savings: 'savings',
      only: 'Only',

      whatsIncluded: "What's included:",
      vaccinationsCovered: 'All yearly vaccinations covered',
      annualCheck: 'annual health check',
      annualChecks: 'annual health checks',
      offPartner: 'off at partner locations',
      groomingSessions: '4 professional grooming sessions',
      teethCleaning: '1 professional teeth cleaning',
      morePerks: '+ More perks as our network expands!',

      // Referral
      referTitle: 'Refer a friend, both save!',
      referDesc: 'When you refer a friend and they sign up,',
      referBonus: 'you both get 1 month FREE',
      referEnd: 'once we launch. Share the love!',

      // Form
      district: 'District',
      email: 'Email Address',
      joinAndSave: 'Join the waitlist & save',
      goBack: 'Go back and adjust',

      // Success
      youreIn: "You're in!",
      personalizedSavings: 'Your personalized savings estimate:',
      withPlanName: 'with',
      plan: 'plan',
      addedToWaitlist: "We've added you to the waitlist for",
      voucher: "You'll receive a",
      voucherAmount: '€20 voucher',
      voucherEnd: 'plus your personalized care plan when we launch!',
      wantFreeMonth: 'Want another month FREE?',
      referFriend: 'Refer a friend to Pet Pass Vienna. When they sign up,',
      bothGetFree: 'you both get 1 month completely FREE',
      onceLaunch: 'once we launch!',
      shareWith: 'Just share this page with fellow pet parents in Vienna!',
      close: 'Close',
    },
  },

  de: {
    // Navbar
    nav: {
      howItWorks: 'So funktioniert\'s',
      plans: 'Tarife',
      partners: 'Partner',
      faq: 'FAQ',
      joinClub: 'Jetzt beitreten',
    },

    // Hero Section
    hero: {
      badge: 'Erster Monat gratis für Frühbucher',
      title1: 'Glückliche Haustiere,',
      title2: 'Gesunde Geldbörsen.',
      subtitle: 'Die günstige Haustier-Gesundheitsmitgliedschaft für Wien. Eine monatliche Gebühr deckt Tierarztbesuche, Impfungen, Fellpflege und lokale Rabatte ab. Spare €400+ pro Jahr an Tierarztkosten.',
      seePlans: 'Tarife ansehen',
      joinWaitlist: 'Auf Warteliste setzen',
      joinedBy: 'Nur 100 Plätze diesen Monat verfügbar — sichere dir deinen!',
      foundingStatus: 'Gründer 100 Status',
      spotsLeft: 'Nur noch {n} Plätze!',
      full: 'Voll',
    },

    // Problem/Solution Section
    problem: {
      title1: 'Schluss mit',
      title2: '"Überraschungs"',
      title3: '-Tierarztrechnungen.',
      subtitle: 'Tierarztkosten in Wien summieren sich schnell. Eine einzelne Untersuchung kostet €40, Impfungen €110+ und Fellpflege €60+ pro Sitzung. Die meisten Tierbesitzer geben',
      annually: '€400+ jährlich',
      subtitle2: 'für Routinepflege aus. Wir bündeln es in ein günstiges monatliches Abo, damit dein Haustier immer versorgt ist.',
      preventiveCare: 'Vorsorge',
      preventiveDesc: 'Hunde- und Katzenimpfungen in Wien abgedeckt. Jährliche Gesundheitschecks ohne zusätzliche Kosten.',
      groomingPerks: 'Fellpflege-Vorteile',
      groomingDesc: 'Professionelle Tierpflege in Wien inklusive. Halte deinen Hund oder deine Katze gepflegt ohne hohe Preise.',
      localDiscounts: 'Lokale Rabatte',
      localDesc: 'Exklusive Rabatte in Wiens besten Tiergeschäften, Tierkliniken und Pflegesalons in allen Bezirken.',
    },

    // How it Works
    howItWorks: {
      title: 'So funktioniert\'s',
      subtitle: 'Das Beste für dein Haustier ist so einfach wie 1-2-3.',
      step1Title: 'Tritt dem Club bei',
      step1Desc: 'Wähle den Tarif, der zum Lebensstil deines Haustieres passt.',
      step2Title: 'Besuche einen Partner',
      step2Desc: 'Gehe zu unserem kuratierten Netzwerk erstklassiger Wiener Tierärzte und Pflegesalons.',
      step3Title: 'Zeig deine Karte',
      step3Desc: 'Keine Zahlung an der Theke. Wir übernehmen die Rechnung; du gibst nur die Leckerlis.',
    },

    // Pricing
    pricing: {
      title1: 'Einfache Preise,',
      title2: 'Keine Überraschungen.',
      subtitle: 'Wähle einen Tarif für deine Mitgliedschaft.',
      mostPopular: 'BELIEBTESTE',
      perMonth: '/Monat',
      getStarted: 'Jetzt starten',
      joinNow: 'Jetzt beitreten',
      riskFree: 'Risikofrei. Jederzeit kündbar. Der erste Monat geht auf uns.',

      basic: {
        name: 'Der Basis',
        description: 'Wesentliche Vorsorge für gesunde Begleiter.',
        features: [
          'Jährliche Impfungen',
          '2x Jährlicher Gesundheitscheck',
          '10% Rabatt bei Partner-Tierärzten',
          'Digitale Mitgliedskarte',
        ],
      },
      carePlus: {
        name: 'Der Care Plus',
        description: 'Umfassende Abdeckung mit Pflegevorteilen.',
        features: [
          'Jährliche Impfungen',
          '3x Jährliche Gesundheitschecks',
          '15% Rabatt auf alle Behandlungen',
          '15% Rabatt in Partner-Shops',
          'Prioritäts-Kundensupport',
        ],
      },
      vip: {
        name: 'Der VIP',
        description: 'Premium-Versorgung mit Fellpflege inklusive — spart €400+/Jahr.',
        features: [
          'Alles aus Care Plus',
          '4x Jährliche Gesundheitschecks',
          '4x Professionelle Pflegesitzungen (€240+ Wert)',
          '1x Professionelle Zahnreinigung (€175 Wert)',
          '25% Rabatt in Partner-Shops',
          '24/7 Prioritäts-Chat',
          'VIP Event Zugang',
          'Mehr Vorteile wenn unser Netzwerk wächst!',
        ],
      },
    },

    // Trust Badges
    trust: {
      guarantee: 'Risikofreie Garantie',
      guaranteeDesc: 'Nicht zufrieden? Volle Rückerstattung innerhalb der ersten 30 Tage, ohne Fragen.',
      noCommitment: 'Jederzeit kündbar',
      noCommitmentDesc: 'Keine Verträge, keine Bindungsfristen. Kündige deine Mitgliedschaft wann du willst.',
      freeMonth: 'Erster Monat gratis',
      freeMonthDesc: 'Teste Pet Pass Vienna komplett gratis. Keine Kreditkarte nötig für die Warteliste.',
    },

    // Partners
    partners: {
      title1: 'Unser wachsendes Wiener',
      title2: 'Ökosystem',
      subtitle: 'Wir bauen ein Netzwerk erstklassiger Partner auf, um sicherzustellen, dass dein Haustier in jedem Bezirk Wiens die beste Versorgung erhält.',
      vets: 'Top-Tierärzte in Bezirken 1-22',
      grooming: 'Premium Pflegesalons',
      boutiques: 'Lokale Bio-Tierboutiquen',
      transparency: '100% Transparenz',
      transparencyDesc: 'Speziell für Wiener Tierbesitzer entwickelt.',
    },

    // FAQ
    faq: {
      title: 'Häufig gestellte Fragen',
      subtitle: 'Alles, was du über Pet Pass Vienna wissen musst.',
      q1: 'Was genau ist Pet Pass Vienna?',
      a1: 'Pet Pass Vienna ist eine monatliche Tiergesundheits-Mitgliedschaft. Anstatt einzelne Tierarztbesuche, Impfungen und Pflegesitzungen separat zu bezahlen, zahlst du eine planbare monatliche Gebühr, die Vorsorge bei unseren Partnerstandorten in ganz Wien abdeckt.',
      q2: 'Kann ich jederzeit kündigen?',
      a2: 'Ja, absolut. Es gibt keine langfristigen Verträge. Du kannst deine Mitgliedschaft jederzeit ohne Kündigungsgebühren beenden. Dein erster Monat ist komplett gratis, sodass du es risikofrei testen kannst.',
      q3: 'Wie viel kann ich wirklich sparen?',
      a3: 'Die meisten Tierbesitzer in Wien geben €400-800+ pro Jahr für routinemäßige Tierarztbesuche, Impfungen und Fellpflege aus. Je nach Tarif kannst du 20-40% dieser Kosten sparen. Nutze unseren Sparrechner für deine persönliche Schätzung.',
      q4: 'Welche Tierärzte und Pflegesalons sind dabei?',
      a4: 'Wir bauen ein kuratiertes Netzwerk erstklassiger Tierkliniken und Pflegesalons in den Wiener Bezirken 1-9 auf (Erweiterung auf alle Bezirke folgt). Alle Partner werden auf Qualität und Kundenzufriedenheit geprüft.',
      q5: 'Wann startet Pet Pass Vienna?',
      a5: 'Wir starten bald in den Bezirken 1-9. Tritt der Gründer 100 Warteliste bei, um Early Access, deinen ersten Monat gratis und einen €20 Willkommensgutschein zu erhalten.',
      q6: 'Ist das eine Tierversicherung?',
      a6: 'Nein. Pet Pass Vienna ist eine Gesundheitsmitgliedschaft, keine Versicherung. Anders als bei Versicherungen gibt es keine Anträge, keine Selbstbeteiligung und keine Wartezeiten. Du besuchst einfach einen Partner-Tierarzt oder Pflegesalon, zeigst deine digitale Mitgliedskarte und wir kümmern uns um den Rest.',
    },

    // Waitlist Section
    waitlist: {
      badge: 'Begrenzte Verfügbarkeit',
      title: 'Sichere deinen Platz bei den Gründer 100',
      subtitle: 'Wir starten zuerst in den Bezirken 1-9. Tritt heute der Warteliste bei und erhalte deinen',
      freeMonth: 'ersten Monat komplett gratis.',
      joinButton: 'Auf Warteliste setzen',
      referral: 'Freund empfehlen →',
      referralBonus: 'Beide bekommen 1 Monat GRATIS!',
    },

    // Sticky CTA
    stickyCta: {
      joinNow: 'Warteliste beitreten — Erster Monat gratis',
    },

    // Footer
    footer: {
      privacy: 'Datenschutz',
      terms: 'AGB',
      impressum: 'Impressum',
      contact: 'Kontakt',
      copyright: '© 2024 Pet Pass Vienna. Alle Rechte vorbehalten. Mit Liebe für Wiens Haustiere gestaltet.',
    },

    // Survey Modal
    survey: {
      step: 'Schritt',
      of: 'von',

      // Quick Join
      quickJoinTitle: 'Werde einer der Gründer 100',
      quickJoinSubtitle: 'Gehöre zu den Ersten, die bei der Tiergesundheit in Wien sparen.',
      reserveSpot: 'Meinen Platz reservieren',
      orCalculateSavings: 'Willst du deine persönliche Ersparnis sehen? Mach das 2-Minuten-Quiz →',
      quickSuccessMessage: 'Du bist auf der Liste! Wir senden dir einen €20-Gutschein und Early-Access-Details wenn wir starten.',

      // Step 1
      step1Title: 'Erzähl uns von deinem Haustier',
      step1Subtitle: 'Lass uns den perfekten Tarif für deinen pelzigen Freund finden',
      petType: 'Welche Art von Haustier hast du?',
      dog: 'Hund',
      cat: 'Katze',
      rabbit: 'Hase',
      other: 'Andere',
      howMany: 'Wie viele Haustiere?',
      petAge: 'Alter des Haustieres',
      puppyKitten: 'Welpe/Kätzchen',
      young: 'Jung',
      adult: 'Erwachsen',
      senior: 'Senior',
      years0_1: '0-1 Jahre',
      years1_3: '1-3 Jahre',
      years3_7: '3-7 Jahre',
      years7plus: '7+ Jahre',
      continue: 'Weiter',
      back: 'Zurück',

      // Step 2
      step2Title: 'Tierarztbesuche',
      step2Subtitle: 'Wie oft gehst du normalerweise zum Tierarzt?',
      rarely: 'Selten',
      rarelyDesc: 'Nur wenn etwas nicht stimmt',
      onceYear: 'Einmal im Jahr',
      onceYearDesc: 'Jährliche Untersuchung',
      twiceYear: 'Zweimal im Jahr',
      twiceYearDesc: 'Halbjährliche Besuche',
      quarterly: 'Alle 3 Monate',
      quarterlyDesc: 'Regelmäßige Überwachung',
      monthly: 'Monatlich',
      monthlyDesc: 'Laufende Behandlung',

      // Step 3
      step3Title: 'Gesundheitszustand',
      step3Subtitle: 'Wähle alle Gesundheitsprobleme deines Haustieres aus',
      noHealthIssues: 'Keine Gesundheitsprobleme',
      allergies: 'Allergien',
      diabetes: 'Diabetes',
      jointProblems: 'Gelenkprobleme / Arthritis',
      skinConditions: 'Hauterkrankungen',
      digestiveIssues: 'Verdauungsprobleme',
      heartConditions: 'Herzerkrankungen',
      dentalProblems: 'Zahnprobleme',
      obesity: 'Übergewicht / Gewichtsprobleme',

      // Step 4
      step4Title: 'Pflegebedarf',
      step4Subtitle: 'Wie oft nutzt du professionelle Fellpflege?',
      never: 'Nie',
      neverDesc: 'Ich pflege zu Hause',
      occasional: '1-2 mal im Jahr',
      occasionalDesc: 'Gelegentliche Besuche',
      seasonal: '3-4 mal im Jahr',
      seasonalDesc: 'Jede Saison',
      bimonthly: '5-6 mal im Jahr',
      bimonthlyDesc: 'Jeden zweiten Monat',
      monthlyGrooming: 'Monatlich',
      monthlyGroomingDesc: 'Regelmäßige Pflege',
      seeSavings: 'Meine Ersparnis sehen',

      // Step 5
      step5Title: 'Deine mögliche Ersparnis',
      step5Subtitle: 'Basierend auf Wiener Tierarztpreisen',
      estimatedCosts: 'Deine geschätzten jährlichen Kosten',
      vetCheckups: 'Tierarzt-Untersuchungen',
      vaccinations: 'Impfungen',
      healthConditionCare: 'Gesundheitsbehandlung',
      professionalGrooming: 'Professionelle Fellpflege',
      emergencyBuffer: 'Notfallpuffer (15%)',
      totalWithout: 'Gesamt ohne Mitgliedschaft',
      year: 'Jahr',
      withPlan: 'Mit',
      couldSave: 'Du könntest sparen bis zu',
      perYear: 'pro Jahr',
      savings: 'Ersparnis',
      only: 'Nur',

      whatsIncluded: 'Was ist enthalten:',
      vaccinationsCovered: 'Alle jährlichen Impfungen abgedeckt',
      annualCheck: 'jährlicher Gesundheitscheck',
      annualChecks: 'jährliche Gesundheitschecks',
      offPartner: 'Rabatt bei Partnerstandorten',
      groomingSessions: '4 professionelle Pflegesitzungen',
      teethCleaning: '1 professionelle Zahnreinigung',
      morePerks: '+ Mehr Vorteile wenn unser Netzwerk wächst!',

      // Referral
      referTitle: 'Freund empfehlen, beide sparen!',
      referDesc: 'Wenn du einen Freund empfiehlst und er sich anmeldet,',
      referBonus: 'bekommt ihr beide 1 Monat GRATIS',
      referEnd: 'sobald wir starten. Teile die Freude!',

      // Form
      district: 'Bezirk',
      email: 'E-Mail-Adresse',
      joinAndSave: 'Auf Warteliste & spare',
      goBack: 'Zurück und anpassen',

      // Success
      youreIn: 'Du bist dabei!',
      personalizedSavings: 'Deine persönliche Ersparnis-Schätzung:',
      withPlanName: 'mit',
      plan: 'Tarif',
      addedToWaitlist: 'Wir haben dich zur Warteliste für',
      voucher: 'hinzugefügt. Du erhältst einen',
      voucherAmount: '€20 Gutschein',
      voucherEnd: 'plus deinen personalisierten Pflegeplan wenn wir starten!',
      wantFreeMonth: 'Willst du noch einen Monat GRATIS?',
      referFriend: 'Empfiehl Pet Pass Vienna einem Freund. Wenn er sich anmeldet,',
      bothGetFree: 'bekommt ihr beide 1 Monat komplett GRATIS',
      onceLaunch: 'sobald wir starten!',
      shareWith: 'Teile einfach diese Seite mit anderen Tiereltern in Wien!',
      close: 'Schließen',
    },
  },
};

export type Translations = typeof translations.en;
