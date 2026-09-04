// dataStore.js - Comprehensive mock & persistence store for ExamPredict AI
// Transparently synchronizes with FastAPI backend when available, or provides instant offline study notebook experience.

export const INITIAL_WORKSPACES = [
  {
    id: "bio-201",
    name: "Cell Biology & Molecular Genetics",
    code: "BIO 201",
    semester: "Fall 2026",
    instructor: "Prof. Eleanor Vance",
    description: "Structure, metabolic pathways, genetic information flow, and cellular regulation.",
    color: "#D97706", // warm amber
    icon: "🧬",
    created_at: "2026-08-20T10:00:00Z",
    uploads: [
      {
        id: "u-bio-1",
        filename: "BIO201_Exam_2023_Final.pdf",
        upload_type: "past_questions",
        inferred_year: 2023,
        file_size: 1420000,
        page_count: 8,
        uploaded_at: "2026-08-22T14:30:00Z"
      },
      {
        id: "u-bio-2",
        filename: "BIO201_Exam_2021_Spring.pdf",
        upload_type: "past_questions",
        inferred_year: 2021,
        file_size: 1180000,
        page_count: 6,
        uploaded_at: "2026-08-22T14:32:00Z"
      },
      {
        id: "u-bio-3",
        filename: "BIO201_Exam_2019_Winter.pdf",
        upload_type: "past_questions",
        inferred_year: 2019,
        file_size: 980000,
        page_count: 5,
        uploaded_at: "2026-08-22T14:34:00Z"
      },
      {
        id: "u-bio-4",
        filename: "Lecture_Notes_Module3_Bioenergetics.pdf",
        upload_type: "study_material",
        inferred_year: 2026,
        file_size: 3850000,
        page_count: 42,
        uploaded_at: "2026-08-23T09:15:00Z"
      },
      {
        id: "u-bio-5",
        filename: "Syllabus_Molecular_Genetics_Handout.docx",
        upload_type: "study_material",
        inferred_year: 2026,
        file_size: 820000,
        page_count: 14,
        uploaded_at: "2026-08-23T09:20:00Z"
      }
    ],
    predictions: [
      {
        id: "pred-bio-1",
        question_text: "Explain the biochemical mechanism of the light-dependent reactions of photosynthesis, highlighting the roles of Photosystems II and I, the electron transport chain, and ATP synthesis via photophosphorylation.",
        topic: "Photosynthesis & Bioenergetics",
        difficulty_level: "challenging", // foundation | intermediate | challenging
        recurrence_count: 4,
        years_appeared: [2023, 2021, 2019, 2017],
        frequency_score: 0.95,
        mark_allocation: 20,
        bookmarked: true,
        is_reviewed: false,
        is_hard: true,
        historical_variants: [
          "2023: Detail the light reactions in the thylakoid membrane, emphasizing non-cyclic electron flow and Z-scheme energetics.",
          "2021: Describe with diagrams how solar photons excite chlorophyll to drive the generation of NADPH and ATP in chloroplasts.",
          "2019: Contrast Photosystem I and II functions during photophosphorylation and state the final electron acceptor.",
          "2017: Outline the steps of the light-dependent phase of photosynthesis and proton gradient establishment."
        ],
        explanation: {
          grounding_type: "grounded_in_notes", // grounded_in_notes | mixed | general_knowledge
          grounding_score: 0.94,
          core_concept: "Light-dependent reactions occur in the thylakoid membrane, converting solar irradiance into biochemical currency (ATP and NADPH) through the Z-scheme electron transport chain powered by photolysis of water.",
          step_by_step: [
            {
              step: 1,
              title: "Photon Absorption & Photolysis at Photosystem II (P680)",
              description: "Light excites P680 reaction center electrons. The oxygen-evolving complex splits 2 H₂O into 4 H⁺, 4 e⁻, and O₂, replenishing lost electrons."
            },
            {
              step: 2,
              title: "Electron Transport Chain & Plastoquinone Proton Pumping",
              description: "High-energy electrons cascade from Pheophytin → Plastoquinone (PQ) → Cytochrome b6f complex → Plastocyanin (PC). This pumps H⁺ from stroma into thylakoid lumen, generating a strong proton-motive force (ΔpH)."
            },
            {
              step: 3,
              title: "Re-excitation at Photosystem I (P700) & NADPH Production",
              description: "Photons re-energize electrons in PSI (P700). Electrons transfer through Ferredoxin (Fd) to Ferredoxin-NADP⁺ reductase (FNR) to reduce NADP⁺ + H⁺ into NADPH in the stroma."
            },
            {
              step: 4,
              title: "Chemiosmotic Photophosphorylation",
              description: "Protons in the lumen stream down their electrochemical gradient back into the stroma through CF₀-CF₁ ATP Synthase, driving the rotary synthesis of ATP from ADP and Pi."
            }
          ],
          key_takeaways: [
            "Non-cyclic electron flow produces both ATP and NADPH in equal proportion.",
            "Water is the primary electron donor; NADP⁺ is the terminal electron acceptor.",
            "Proton accumulation in the thylakoid lumen creates the electrochemical gradient driving ATP synthase."
          ],
          pitfalls_to_avoid: [
            "Don't confuse the thylakoid lumen with the stroma when describing proton gradient direction (protons are concentrated in the LUMEN).",
            "Remember that cyclic photophosphorylation engages only PSI and generates ONLY ATP without NADPH or O₂ evolution."
          ],
          cited_sources: [
            {
              document_name: "Lecture_Notes_Module3_Bioenergetics.pdf",
              page_number: 14,
              excerpt: "Section 3.2: Non-Cyclic Photophosphorylation and the Thylakoid Proton Battery (pp. 14-17)."
            },
            {
              document_name: "BIO201_Exam_2023_Final.pdf",
              page_number: 3,
              excerpt: "Section B, Question 4: Light Reaction Kinetics (20 Marks)."
            }
          ]
        }
      },
      {
        id: "pred-bio-2",
        question_text: "Compare and contrast the molecular mechanisms of leading strand and lagging strand synthesis during eukaryotic DNA replication, specifically detailing the role of Okazaki fragments and DNA Ligase.",
        topic: "Molecular Genetics & Replication",
        difficulty_level: "intermediate",
        recurrence_count: 3,
        years_appeared: [2023, 2020, 2018],
        frequency_score: 0.82,
        mark_allocation: 15,
        bookmarked: false,
        is_reviewed: true,
        is_hard: false,
        historical_variants: [
          "2023: Why is DNA replication semi-discontinuous? Explain the enzymatic mechanics on the lagging strand.",
          "2020: Describe the synthesis of Okazaki fragments and their processing into a continuous DNA duplex.",
          "2018: Compare DNA Polymerase delta and epsilon roles at the replication fork."
        ],
        explanation: {
          grounding_type: "grounded_in_notes",
          grounding_score: 0.91,
          core_concept: "Due to the antiparallel nature of DNA and the strict 5'→3' polymerization direction of DNA polymerases, replication proceeds continuously on the leading strand and discontinuously as Okazaki fragments on the lagging strand.",
          step_by_step: [
            {
              step: 1,
              title: "Helicase Unwinding & RNA Priming",
              description: "MCM helicase unwinds parental duplex; DNA Polymerase α/primase synthesizes short ~10nt RNA primers at regular intervals along the lagging template."
            },
            {
              step: 2,
              title: "Polymerase Switch & Okazaki Elongation",
              description: "PCNA clamp recruits DNA Polymerase δ to extend each RNA primer into ~100-200 bp Okazaki fragments until hitting the downstream primer."
            },
            {
              step: 3,
              title: "Primer Removal & Nick Sealing",
              description: "FEN1 (Flap Endonuclease) removes displaced RNA flaps, Pol δ fills the gap, and DNA Ligase I catalyzes phosphodiester bond formation using ATP."
            }
          ],
          key_takeaways: [
            "Leading strand: continuous synthesis by Pol ε.",
            "Lagging strand: discontinuous synthesis of Okazaki fragments by Pol δ.",
            "Ligase seals 3'-OH and 5'-phosphate nicks."
          ],
          pitfalls_to_avoid: [
            "Do not state that DNA is read 5'→3'; the template strand is read 3'→5' and newly synthesized 5'→3'."
          ],
          cited_sources: [
            {
              document_name: "Syllabus_Molecular_Genetics_Handout.docx",
              page_number: 6,
              excerpt: "Unit 2: Semi-discontinuous DNA replication machinery & clamp loaders."
            }
          ]
        }
      },
      {
        id: "pred-bio-3",
        question_text: "Discuss the stages and regulation of the eukaryotic Cell Cycle, with specific emphasis on Cyclin-CDK complex activation and the G1/S restriction checkpoint.",
        topic: "Cell Cycle & Regulation",
        difficulty_level: "challenging",
        recurrence_count: 3,
        years_appeared: [2022, 2021, 2019],
        frequency_score: 0.78,
        mark_allocation: 15,
        bookmarked: true,
        is_reviewed: false,
        is_hard: true,
        historical_variants: [
          "2022: Explain the biochemical control of the G1/S checkpoint involving Rb phosphorylation and E2F transcription factor.",
          "2021: Describe how CDK activity is regulated by cyclin synthesis, CAK phosphorylation, and Wee1/Cdc25 balance."
        ],
        explanation: {
          grounding_type: "grounded_in_notes",
          grounding_score: 0.88,
          core_concept: "Cell cycle progression is an irreversible, unidirectional engine governed by oscillating Cyclin levels that activate Cyclin-Dependent Kinases (CDKs), guarded by strict surveillance checkpoints.",
          step_by_step: [
            {
              step: 1,
              title: "Mitogen Signal & Cyclin D Accumulation",
              description: "Extracellular growth factors trigger Ras-MAPK cascade, inducing Cyclin D synthesis which pairs with CDK4/6."
            },
            {
              step: 2,
              title: "Retinoblastoma (Rb) Hyperphosphorylation",
              description: "Cyclin D-CDK4/6 phosphorylates Rb protein, releasing the sequestered E2F transcription factor to transcribe Cyclin E and DNA replication genes."
            },
            {
              step: 3,
              title: "Positive Feedback & Passing the Restriction Point",
              description: "Cyclin E-CDK2 complexes hyperphosphorylate remaining Rb, making progression into S-phase mitogen-independent."
            }
          ],
          key_takeaways: [
            "Checkpoints prevent replication of damaged DNA.",
            "p53/p21 pathway arrests cycle in response to double-strand breaks."
          ],
          pitfalls_to_avoid: [
            "Do not confuse Cyclin concentrations (which fluctuate) with CDK concentrations (which remain relatively constant)."
          ],
          cited_sources: [
            {
              document_name: "Lecture_Notes_Module3_Bioenergetics.pdf",
              page_number: 31,
              excerpt: "Module 3.5: Cell Division, Kinase cascades, and oncogenic checkpoint bypass."
            }
          ]
        }
      },
      {
        id: "pred-bio-4",
        question_text: "Describe the Fluid Mosaic Model of biological membranes, detailing the roles of phospholipids, cholesterol, integral proteins, and lipid rafts in membrane fluidity.",
        topic: "Membrane Structure & Transport",
        difficulty_level: "foundation",
        recurrence_count: 2,
        years_appeared: [2022, 2019],
        frequency_score: 0.65,
        mark_allocation: 10,
        bookmarked: false,
        is_reviewed: true,
        is_hard: false,
        historical_variants: [
          "2022: Explain how cholesterol acts as a bidirectional fluidity buffer in mammalian cell membranes.",
          "2019: Diagram the Singer-Nicolson fluid mosaic membrane model and identify 4 major components."
        ],
        explanation: {
          grounding_type: "grounded_in_notes",
          grounding_score: 0.95,
          core_concept: "Proposed by Singer and Nicolson, the fluid mosaic model depicts the plasma membrane as a two-dimensional liquid crystalline phospholipid bilayer studded with mobile proteins and carbohydrates.",
          step_by_step: [
            {
              step: 1,
              title: "Amphipathic Bilayer Organization",
              description: "Hydrophilic phosphate heads face aqueous intra- and extracellular fluids; hydrophobic fatty acid tails sequester inward."
            },
            {
              step: 2,
              title: "Fluidity Buffering by Cholesterol",
              description: "At high temperatures, cholesterol restricts phospholipid movement; at low temperatures, it prevents tight packing and crystallization."
            }
          ],
          key_takeaways: [
            "Unsaturated fatty acid kinks increase fluidity.",
            "Lipid rafts concentrate signaling receptors."
          ],
          pitfalls_to_avoid: [
            "Integral proteins cannot easily flip-flop across monolayers, but diffuse laterally."
          ],
          cited_sources: [
            {
              document_name: "Lecture_Notes_Module3_Bioenergetics.pdf",
              page_number: 5,
              excerpt: "Section 1.3: Plasma membrane biophysics & thermodynamics."
            }
          ]
        }
      },
      {
        id: "pred-bio-5",
        question_text: "Analyze the enzymatic steps of the Citric Acid Cycle (Krebs Cycle) that generate reducing equivalents (NADH and FADH₂), and calculate the theoretical ATP yield per glucose molecule.",
        topic: "Photosynthesis & Bioenergetics",
        difficulty_level: "intermediate",
        recurrence_count: 2,
        years_appeared: [2021, 2018],
        frequency_score: 0.60,
        mark_allocation: 15,
        bookmarked: false,
        is_reviewed: false,
        is_hard: false,
        historical_variants: [
          "2021: Trace the carbon atoms from Acetyl-CoA through one full turn of the Krebs cycle.",
          "2018: Calculate the net ATP yield from oxidative phosphorylation per mol of glucose."
        ],
        explanation: {
          grounding_type: "grounded_in_notes",
          grounding_score: 0.89,
          core_concept: "The Krebs Cycle in the mitochondrial matrix oxidizes acetyl groups into 2 CO₂, capturing free energy into 3 NADH, 1 FADH₂, and 1 GTP/ATP per turn.",
          step_by_step: [
            {
              step: 1,
              title: "Citrate Synthase & Isocitrate Dehydrogenase",
              description: "Acetyl-CoA (2C) + Oxaloacetate (4C) → Citrate (6C). Oxidative decarboxylation generates 1st NADH + CO₂."
            },
            {
              step: 2,
              title: "α-Ketoglutarate Dehydrogenase & Succinate",
              description: "Produces 2nd NADH + CO₂. Succinyl-CoA synthetase produces GTP (substrate-level phosphorylation)."
            },
            {
              step: 3,
              title: "Succinate Dehydrogenase & Malate Dehydrogenase",
              description: "Oxidizes succinate to fumarate (yielding FADH₂), then malate to oxaloacetate (yielding 3rd NADH)."
            }
          ],
          key_takeaways: [
            "Total per glucose (2 turns): 6 NADH, 2 FADH₂, 2 GTP.",
            "Net theoretical yield: 30-32 ATP."
          ],
          pitfalls_to_avoid: [
            "Remember that Glycolysis produces 2 Pyruvates, so the cycle turns TWICE per glucose molecule."
          ],
          cited_sources: [
            {
              document_name: "Lecture_Notes_Module3_Bioenergetics.pdf",
              page_number: 22,
              excerpt: "Chapter 4: Mitochondrial Respiration and Substrate Decarboxylation."
            }
          ]
        }
      },
      {
        id: "pred-bio-6",
        question_text: "Differentiate between Allopatric, Sympatric, and Parapatric speciation mechanisms, giving specific evolutionary reproductive isolation barriers for each.",
        topic: "Evolution & Population Genetics",
        difficulty_level: "foundation",
        recurrence_count: 2,
        years_appeared: [2022, 2020],
        frequency_score: 0.52,
        mark_allocation: 10,
        bookmarked: false,
        is_reviewed: false,
        is_hard: false,
        historical_variants: [
          "2022: Describe how polyploidy leads to instantaneous sympatric speciation in plants.",
          "2020: Compare geographic versus behavioral isolation in establishing new species."
        ],
        explanation: {
          grounding_type: "general_knowledge",
          grounding_score: 0.72,
          core_concept: "Speciation is the evolutionary lineage-splitting event resulting in distinct biological species due to pre-zygotic or post-zygotic reproductive isolating mechanisms.",
          step_by_step: [
            {
              step: 1,
              title: "Allopatric Speciation",
              description: "Geographic barrier (mountain, river) physically bifurcates population, allowing genetic drift and divergent selection."
            },
            {
              step: 2,
              title: "Sympatric Speciation",
              description: "Occurs within the same geographical range, often via polyploidy, ecological niche differentiation, or sexual selection."
            }
          ],
          key_takeaways: [
            "Reproductive isolation is the hallmark of Ernst Mayr's biological species concept.",
            "Pre-zygotic barriers prevent fertilization; post-zygotic reduce hybrid viability."
          ],
          pitfalls_to_avoid: [
            "Do not confuse geographical separation with temporal/behavioral isolation."
          ],
          cited_sources: []
        }
      }
    ]
  },
  {
    id: "law-102",
    name: "Law of Contract & Commercial Obligations",
    code: "LAW 102",
    semester: "Fall 2026",
    instructor: "Justice Julian Montgomery",
    description: "Formation of valid contracts, doctrine of consideration, vitiating factors, and remedies for breach.",
    color: "#EA580C", // warm orange
    icon: "⚖️",
    created_at: "2026-08-21T11:00:00Z",
    uploads: [
      {
        id: "u-law-1",
        filename: "LAW102_PastPaper_2023.pdf",
        upload_type: "past_questions",
        inferred_year: 2023,
        file_size: 1620000,
        page_count: 6,
        uploaded_at: "2026-08-24T10:00:00Z"
      },
      {
        id: "u-law-2",
        filename: "LAW102_PastPaper_2022.pdf",
        upload_type: "past_questions",
        inferred_year: 2022,
        file_size: 1400000,
        page_count: 5,
        uploaded_at: "2026-08-24T10:02:00Z"
      },
      {
        id: "u-law-3",
        filename: "Contract_Law_Principles_LectureNotes.pdf",
        upload_type: "study_material",
        inferred_year: 2026,
        file_size: 4200000,
        page_count: 58,
        uploaded_at: "2026-08-24T10:15:00Z"
      }
    ],
    predictions: [
      {
        id: "pred-law-1",
        question_text: "Discuss the essential elements required to form a legally binding contract under common law, with particular reference to the distinction between an offer and an invitation to treat (Carlill v Carbolic Smoke Ball Co; Pharmaceutical Society of Great Britain v Boots).",
        topic: "Formation of Contract",
        difficulty_level: "foundation",
        recurrence_count: 5,
        years_appeared: [2023, 2022, 2021, 2020, 2018],
        frequency_score: 0.98,
        mark_allocation: 25,
        bookmarked: true,
        is_reviewed: true,
        is_hard: false,
        historical_variants: [
          "2023: Critically examine the objective test of contractual agreement and distinguish offers from display of goods in retail stores.",
          "2022: 'An invitation to treat is merely an invitation to negotiate.' Discuss with reference to Fisher v Bell and Boots Cash Chemists.",
          "2021: State the 4 pillars of contract formation and explain how unilateral contracts differ from bilateral contracts."
        ],
        explanation: {
          grounding_type: "grounded_in_notes",
          grounding_score: 0.96,
          core_concept: "A binding contract requires: Offer, Acceptance, Consideration, Intention to create legal relations, and Capacity. An offer must be distinguished from an invitation to treat, which invites others to make an offer.",
          step_by_step: [
            {
              step: 1,
              title: "Offer vs. Invitation to Treat",
              description: "An offer expresses definitive willingness to contract on specified terms. Display of goods on shelves (Boots [1953]) or in shop windows (Fisher v Bell [1961]) constitutes an invitation to treat."
            },
            {
              step: 2,
              title: "Unilateral vs Bilateral Offers",
              description: "Carlill v Carbolic Smoke Ball Co [1893] established that an advertisement offering a reward for performing conditions can constitute an offer to the whole world, waiving notice of acceptance."
            },
            {
              step: 3,
              title: "Acceptance & Postal Rule",
              description: "Acceptance must be unconditional and mirror the offer (Adams v Lindsell; Entores v Miles Far East Corp)."
            }
          ],
          key_takeaways: [
            "Objective standard: would a reasonable person believe an agreement was reached?",
            "Auctions with or without reserve have distinct legal rules (Barry v Davies)."
          ],
          pitfalls_to_avoid: [
            "Never cite display of price-tagged goods as an offer; it is an invitation to treat."
          ],
          cited_sources: [
            {
              document_name: "Contract_Law_Principles_LectureNotes.pdf",
              page_number: 4,
              excerpt: "Chapter 1: Agreement - Offer and Acceptance Mechanics (pp. 4-12)."
            }
          ]
        }
      },
      {
        id: "pred-law-2",
        question_text: "Evaluate the Doctrine of Consideration in modern contract law, specifically analyzing past consideration, performance of pre-existing legal duties (Stilk v Myrick vs Williams v Roffey Bros), and Promissory Estoppel (Central London Property Trust v High Trees House).",
        topic: "Consideration & Estoppel",
        difficulty_level: "challenging",
        recurrence_count: 4,
        years_appeared: [2023, 2021, 2020, 2017],
        frequency_score: 0.88,
        mark_allocation: 25,
        bookmarked: false,
        is_reviewed: false,
        is_hard: true,
        historical_variants: [
          "2023: Has Williams v Roffey Bros eroded the traditional requirement of consideration? Discuss practical benefit doctrine.",
          "2021: Assess the operation of Promissory Estoppel as a shield, not a sword (Combe v Combe)."
        ],
        explanation: {
          grounding_type: "grounded_in_notes",
          grounding_score: 0.92,
          core_concept: "Consideration must be sufficient but need not be adequate (Thomas v Thomas). The practical benefit doctrine in Williams v Roffey modified strict pre-existing duty rules, while promissory estoppel provides equitable relief against unconscionable reneging.",
          step_by_step: [
            {
              step: 1,
              title: "Pre-existing Contractual Duty",
              description: "Stilk v Myrick [1809] ruled that performing an existing duty is no consideration. Williams v Roffey [1991] recognized practical commercial benefit as valid consideration in the absence of economic duress."
            },
            {
              step: 2,
              title: "Pinnel's Case & Part-Payment of Debt",
              description: "Foakes v Beer [1884] upheld that part-payment of debt is not satisfaction for the whole without fresh consideration."
            },
            {
              step: 3,
              title: "High Trees Promissory Estoppel",
              description: "Denning J established that a clear promise intended to be acted upon and in fact acted upon prevents the promisor from acting inconsistently with that promise."
            }
          ],
          key_takeaways: [
            "Past consideration is no consideration (Roscorla v Thomas; exceptions in Pao On v Lau Yiu Long).",
            "Promissory estoppel requires an existing legal relationship and reliance."
          ],
          pitfalls_to_avoid: [
            "Promissory estoppel cannot create a new cause of action where no consideration existed originally (shield not sword)."
          ],
          cited_sources: [
            {
              document_name: "Contract_Law_Principles_LectureNotes.pdf",
              page_number: 18,
              excerpt: "Chapter 3: The Consideration Conundrum and Equitable Estoppel."
            }
          ]
        }
      },
      {
        id: "pred-law-3",
        question_text: "Distinguish between Conditions, Warranties, and Innominate Terms in contract construction, and analyze the Hong Kong Fir Shipping test for determining the right to repudiate.",
        topic: "Terms & Breach",
        difficulty_level: "intermediate",
        recurrence_count: 3,
        years_appeared: [2022, 2020, 2019],
        frequency_score: 0.74,
        mark_allocation: 20,
        bookmarked: false,
        is_reviewed: false,
        is_hard: false,
        historical_variants: [
          "2022: How did Diplock LJ's judgment in Hong Kong Fir change the classification of contractual terms?",
          "2020: Discuss remedies available for breach of warranty versus fundamental breach."
        ],
        explanation: {
          grounding_type: "grounded_in_notes",
          grounding_score: 0.85,
          core_concept: "Terms go to the root of a contract (conditions), are subsidiary (warranties), or are innominate (classified by the consequences of breach under the Hong Kong Fir test).",
          step_by_step: [
            {
              step: 1,
              title: "Condition vs Warranty",
              description: "Breach of condition allows termination + damages (Poussard v Spiers). Breach of warranty allows damages only (Bettini v Gye)."
            },
            {
              step: 2,
              title: "Innominate Terms Approach",
              description: "Hong Kong Fir Shipping [1962]: Look at the effect of breach — does it deprive the innocent party of substantially the whole benefit?"
            }
          ],
          key_takeaways: [
            "Commercial certainty vs fairness tension.",
            "Parties can explicitly stipulate terms as conditions unless contrary to statute."
          ],
          pitfalls_to_avoid: [
            "Calling a term a 'condition' in the contract isn't always conclusive if commercially absurd (Schuler v Wickman)."
          ],
          cited_sources: [
            {
              document_name: "Contract_Law_Principles_LectureNotes.pdf",
              page_number: 34,
              excerpt: "Section 4.2: Classification of Express Terms and Repudiatory Breach."
            }
          ]
        }
      }
    ]
  },
  {
    id: "cs-304",
    name: "Algorithms & Data Structures",
    code: "CS 304",
    semester: "Fall 2026",
    instructor: "Dr. Aris Thorne",
    description: "Asymptotic analysis, divide & conquer, graph algorithms, dynamic programming, and advanced tree data structures.",
    color: "#7C3AED", // purple/indigo
    icon: "⚡",
    created_at: "2026-08-22T08:00:00Z",
    uploads: [
      {
        id: "u-cs-1",
        filename: "CS304_Final_Exam_2023.pdf",
        upload_type: "past_questions",
        inferred_year: 2023,
        file_size: 1950000,
        page_count: 10,
        uploaded_at: "2026-08-25T11:00:00Z"
      },
      {
        id: "u-cs-2",
        filename: "CS304_Algorithms_Textbook_Excerpts.pdf",
        upload_type: "study_material",
        inferred_year: 2026,
        file_size: 5100000,
        page_count: 64,
        uploaded_at: "2026-08-25T11:10:00Z"
      }
    ],
    predictions: [
      {
        id: "pred-cs-1",
        question_text: "Formally state Dijkstra's Algorithm for the single-source shortest path problem. Prove its correctness on graphs with non-negative edge weights using induction, and analyze its time complexity using a Fibonacci Heap vs Binary Heap.",
        topic: "Graph Algorithms",
        difficulty_level: "challenging",
        recurrence_count: 4,
        years_appeared: [2023, 2022, 2021, 2019],
        frequency_score: 0.92,
        mark_allocation: 20,
        bookmarked: true,
        is_reviewed: false,
        is_hard: true,
        historical_variants: [
          "2023: Trace Dijkstra's algorithm step-by-step on a 6-node weighted graph and explain why negative weights cause failure.",
          "2022: Prove the greedy choice property of Dijkstra's algorithm."
        ],
        explanation: {
          grounding_type: "grounded_in_notes",
          grounding_score: 0.94,
          core_concept: "Dijkstra is a greedy algorithm maintaining a set of visited vertices whose shortest distances from the source are finalized. It repeatedly extracts the minimum tentative distance node.",
          step_by_step: [
            {
              step: 1,
              title: "Initialization & Priority Queue",
              description: "Set dist[source] = 0 and dist[v] = ∞ for all v ≠ source. Insert all vertices into min-priority queue Q."
            },
            {
              step: 2,
              title: "Greedy Extraction & Edge Relaxation",
              description: "Extract node u with min dist[u]. For each neighbor v: if dist[u] + weight(u,v) < dist[v], update dist[v] and decreaseKey in Q."
            },
            {
              step: 3,
              title: "Complexity Breakdown",
              description: "With Binary Heap: O((V + E) log V). With Fibonacci Heap: O(E + V log V) because decreaseKey is O(1) amortized."
            }
          ],
          key_takeaways: [
            "Fails on negative weight cycles (use Bellman-Ford instead).",
            "Optimal substructure property enables dynamic/greedy approach."
          ],
          pitfalls_to_avoid: [
            "Do not state that Dijkstra works with negative edge weights as long as there are no cycles; ANY negative edge can invalidate the finalized distance invariant."
          ],
          cited_sources: [
            {
              document_name: "CS304_Algorithms_Textbook_Excerpts.pdf",
              page_number: 28,
              excerpt: "Section 7.4: Greedy Graph Traversals & Shortest Paths."
            }
          ]
        }
      },
      {
        id: "pred-cs-2",
        question_text: "Explain the dynamic programming approach to solve the 0/1 Knapsack Problem. Define the recurrence relation, construct the bottom-up DP table for n items and capacity W, and explain how to reconstruct the selected items.",
        topic: "Dynamic Programming",
        difficulty_level: "intermediate",
        recurrence_count: 3,
        years_appeared: [2023, 2021, 2018],
        frequency_score: 0.81,
        mark_allocation: 15,
        bookmarked: false,
        is_reviewed: true,
        is_hard: false,
        historical_variants: [
          "2023: Derive the optimal substructure equation for 0/1 Knapsack and explain pseudo-polynomial time.",
          "2021: Compare Fractional Knapsack (Greedy) with 0/1 Knapsack (DP)."
        ],
        explanation: {
          grounding_type: "grounded_in_notes",
          grounding_score: 0.90,
          core_concept: "DP[i][w] represents maximum value obtainable using a subset of the first i items with weight limit w. Recurrence: DP[i][w] = max(DP[i-1][w], DP[i-1][w - wt[i]] + val[i]).",
          step_by_step: [
            {
              step: 1,
              title: "State Definition & Base Cases",
              description: "Table size (n+1) × (W+1). DP[0][w] = 0 and DP[i][0] = 0."
            },
            {
              step: 2,
              title: "Bottom-Up Iteration",
              description: "If wt[i-1] <= w, take max of including or excluding item i. Else DP[i][w] = DP[i-1][w]."
            },
            {
              step: 3,
              title: "Backtracking Selection",
              description: "Start at DP[n][W]. If DP[i][w] != DP[i-1][w], item i was included; subtract wt[i] and move to i-1."
            }
          ],
          key_takeaways: [
            "Time complexity: O(n × W) — pseudo-polynomial.",
            "Space can be optimized to O(W) using a 1D array traversed backwards."
          ],
          pitfalls_to_avoid: [
            "When optimizing to a 1D array, iterate weights backwards (W down to wt[i]) to avoid reusing the same item multiple times."
          ],
          cited_sources: [
            {
              document_name: "CS304_Algorithms_Textbook_Excerpts.pdf",
              page_number: 45,
              excerpt: "Chapter 9: Dynamic Programming & Overlapping Subproblems."
            }
          ]
        }
      }
    ]
  },
  {
    id: "econ-101",
    name: "Principles of Microeconomics",
    code: "ECON 101",
    semester: "Fall 2026",
    instructor: "Prof. Marcus Sterling",
    description: "Consumer theory, supply and demand elasticity, market structures, externalities, and welfare economics.",
    color: "#059669", // emerald
    icon: "📈",
    created_at: "2026-08-23T14:00:00Z",
    uploads: [
      {
        id: "u-econ-1",
        filename: "ECON101_Midterm_2023.pdf",
        upload_type: "past_questions",
        inferred_year: 2023,
        file_size: 1100000,
        page_count: 5,
        uploaded_at: "2026-08-26T09:00:00Z"
      },
      {
        id: "u-econ-2",
        filename: "Microeconomics_Lecture_Slides_Full.pdf",
        upload_type: "study_material",
        inferred_year: 2026,
        file_size: 3400000,
        page_count: 36,
        uploaded_at: "2026-08-26T09:10:00Z"
      }
    ],
    predictions: [
      {
        id: "pred-econ-1",
        question_text: "Define Price Elasticity of Demand (PED). Explain the midpoint method of calculation and analyze four major determinants of elasticity (availability of substitutes, luxury vs necessity, definition of market, time horizon).",
        topic: "Elasticity & Market Dynamics",
        difficulty_level: "foundation",
        recurrence_count: 4,
        years_appeared: [2023, 2022, 2020, 2018],
        frequency_score: 0.90,
        mark_allocation: 15,
        bookmarked: false,
        is_reviewed: true,
        is_hard: false,
        historical_variants: [
          "2023: Calculate PED using the midpoint formula given initial and new price/quantity pairs, and interpret the result.",
          "2022: Why is demand for insulin inelastic while demand for ice cream is elastic? Discuss determinants."
        ],
        explanation: {
          grounding_type: "grounded_in_notes",
          grounding_score: 0.95,
          core_concept: "PED measures responsiveness of quantity demanded to changes in price: (%ΔQd / %ΔP). Midpoint formula calculates percentage changes relative to the average of start and end values.",
          step_by_step: [
            {
              step: 1,
              title: "Midpoint Formula",
              description: "PED = [(Q2 - Q1) / ((Q1 + Q2) / 2)] / [(P2 - P1) / ((P1 + P2) / 2)]."
            },
            {
              step: 2,
              title: "Elasticity Spectrum",
              description: "|PED| > 1: Elastic; |PED| < 1: Inelastic; |PED| = 1: Unit Elastic."
            }
          ],
          key_takeaways: [
            "Total revenue test: price and total revenue move in opposite directions when demand is elastic.",
            "Narrowly defined markets have more elastic demand than broad categories."
          ],
          pitfalls_to_avoid: [
            "Remember that PED is always negative due to the law of demand, but usually discussed in absolute value."
          ],
          cited_sources: [
            {
              document_name: "Microeconomics_Lecture_Slides_Full.pdf",
              page_number: 12,
              excerpt: "Module 2: Elasticity and Total Revenue Relationships."
            }
          ]
        }
      },
      {
        id: "pred-econ-2",
        question_text: "Illustrate using supply and demand diagrams the economic welfare consequences (Consumer Surplus, Producer Surplus, and Deadweight Loss) of a government-imposed binding price ceiling on rental housing (Rent Control).",
        topic: "Market Efficiency & Government Policy",
        difficulty_level: "intermediate",
        recurrence_count: 3,
        years_appeared: [2023, 2021, 2019],
        frequency_score: 0.79,
        mark_allocation: 20,
        bookmarked: true,
        is_reviewed: false,
        is_hard: true,
        historical_variants: [
          "2023: Analyze the shortage and deadweight loss caused by binding price ceilings.",
          "2021: Compare the market distortion of rent control versus direct housing vouchers."
        ],
        explanation: {
          grounding_type: "grounded_in_notes",
          grounding_score: 0.88,
          core_concept: "A binding price ceiling set below equilibrium price causes quantity demanded to exceed quantity supplied, creating shortages, non-price rationing mechanisms, and deadweight loss.",
          step_by_step: [
            {
              step: 1,
              title: "Equilibrium vs Ceiling",
              description: "Ceiling price Pc < Pe creates excess demand (Qd - Qs = shortage)."
            },
            {
              step: 2,
              title: "Surplus Redistribution & Deadweight Loss",
              description: "Consumer surplus changes; producer surplus shrinks; the uncaptured mutually beneficial trades form deadweight loss (DWL)."
            }
          ],
          key_takeaways: [
            "Binding ceilings create queues, black markets, and reduced housing quality.",
            "Long-run shortages are larger than short-run shortages due to greater elasticity."
          ],
          pitfalls_to_avoid: [
            "A price ceiling set ABOVE equilibrium is non-binding and has zero market effect."
          ],
          cited_sources: [
            {
              document_name: "Microeconomics_Lecture_Slides_Full.pdf",
              page_number: 24,
              excerpt: "Module 4: Price Controls and Welfare Analytics."
            }
          ]
        }
      }
    ]
  }
];

const LOCAL_STORAGE_KEY = 'exampredict_workspaces_v2';

class DataStore {
  constructor() {
    this.workspaces = this.loadWorkspaces();
  }

  loadWorkspaces() {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
    // Initialize default if empty
    this.saveWorkspaces(INITIAL_WORKSPACES);
    return INITIAL_WORKSPACES;
  }

  saveWorkspaces(data) {
    try {
      this.workspaces = data;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }

  getWorkspaces() {
    return this.workspaces;
  }

  getWorkspace(id) {
    return this.workspaces.find(w => w.id === id) || null;
  }

  createWorkspace(workspaceData) {
    const newWs = {
      id: `ws-${Date.now()}`,
      name: workspaceData.name,
      code: workspaceData.code || "GEN 101",
      semester: workspaceData.semester || "Current Term",
      instructor: workspaceData.instructor || "",
      description: workspaceData.description || "Course study workspace.",
      color: workspaceData.color || "#F59E0B",
      icon: workspaceData.icon || "📚",
      created_at: new Date().toISOString(),
      uploads: [],
      predictions: []
    };
    const updated = [newWs, ...this.workspaces];
    this.saveWorkspaces(updated);
    return newWs;
  }

  deleteWorkspace(id) {
    const updated = this.workspaces.filter(w => w.id !== id);
    this.saveWorkspaces(updated);
    return true;
  }

  addUpload(workspaceId, uploadData) {
    const ws = this.getWorkspace(workspaceId);
    if (!ws) return null;

    const newUpload = {
      id: `u-${Date.now()}`,
      filename: uploadData.filename,
      upload_type: uploadData.upload_type || "study_material",
      inferred_year: uploadData.inferred_year || new Date().getFullYear(),
      file_size: uploadData.file_size || 1500000,
      page_count: uploadData.page_count || Math.floor(Math.random() * 20) + 4,
      uploaded_at: new Date().toISOString()
    };

    ws.uploads = [newUpload, ...(ws.uploads || [])];
    this.saveWorkspaces([...this.workspaces]);
    return newUpload;
  }

  deleteUpload(workspaceId, uploadId) {
    const ws = this.getWorkspace(workspaceId);
    if (!ws) return false;
    ws.uploads = (ws.uploads || []).filter(u => u.id !== uploadId);
    this.saveWorkspaces([...this.workspaces]);
    return true;
  }

  toggleBookmark(workspaceId, predictionId) {
    const ws = this.getWorkspace(workspaceId);
    if (!ws) return false;
    const pred = (ws.predictions || []).find(p => p.id === predictionId);
    if (!pred) return false;
    pred.bookmarked = !pred.bookmarked;
    this.saveWorkspaces([...this.workspaces]);
    return pred.bookmarked;
  }

  toggleReviewed(workspaceId, predictionId) {
    const ws = this.getWorkspace(workspaceId);
    if (!ws) return false;
    const pred = (ws.predictions || []).find(p => p.id === predictionId);
    if (!pred) return false;
    pred.is_reviewed = !pred.is_reviewed;
    this.saveWorkspaces([...this.workspaces]);
    return pred.is_reviewed;
  }

  toggleHard(workspaceId, predictionId) {
    const ws = this.getWorkspace(workspaceId);
    if (!ws) return false;
    const pred = (ws.predictions || []).find(p => p.id === predictionId);
    if (!pred) return false;
    pred.is_hard = !pred.is_hard;
    this.saveWorkspaces([...this.workspaces]);
    return pred.is_hard;
  }

  // Calculate review progress percentage for a workspace
  getReviewStats(workspace) {
    if (!workspace || !workspace.predictions || workspace.predictions.length === 0) {
      return { total: 0, reviewed: 0, percentage: 0 };
    }
    const total = workspace.predictions.length;
    const reviewed = workspace.predictions.filter(p => p.is_reviewed).length;
    const percentage = Math.round((reviewed / total) * 100);
    return { total, reviewed, percentage };
  }

  // Simulate pipeline run generating or enriching predictions
  runPredictionPipeline(workspaceId) {
    const ws = this.getWorkspace(workspaceId);
    if (!ws) return [];

    // If workspace has no predictions yet, generate high-quality predictions based on course name
    if (!ws.predictions || ws.predictions.length === 0) {
      const generated = [
        {
          id: `pred-${Date.now()}-1`,
          question_text: `Analyze the core theoretical framework of ${ws.name} and explain how fundamental principles apply in practice.`,
          topic: "Core Foundations",
          difficulty_level: "intermediate",
          recurrence_count: 3,
          years_appeared: [2023, 2021, 2019],
          frequency_score: 0.85,
          mark_allocation: 20,
          bookmarked: true,
          is_reviewed: false,
          is_hard: false,
          historical_variants: [
            `2023: Explain the core concepts of ${ws.code} with relevant case examples.`,
            `2021: Discuss the fundamental theorems in ${ws.name}.`
          ],
          explanation: {
            grounding_type: "grounded_in_notes",
            grounding_score: 0.92,
            core_concept: `The foundational architecture of ${ws.name} rests upon systematic methodology and verified operational models.`,
            step_by_step: [
              {
                step: 1,
                title: "Primary Principles Identification",
                description: "Isolate the governing laws and definitions from course materials."
              },
              {
                step: 2,
                title: "Applied Problem Solving",
                description: "Synthesize empirical results with theoretical axioms."
              }
            ],
            key_takeaways: [
              "Master standard terminology and definitions.",
              "Structure answers with clear headings and diagrammatic proofs."
            ],
            pitfalls_to_avoid: [
              "Avoid generic descriptions without citing syllabus models."
            ],
            cited_sources: (ws.uploads || []).slice(0, 2).map((u, i) => ({
              document_name: u.filename,
              page_number: i * 5 + 3,
              excerpt: `Key section from ${u.filename} on fundamental principles.`
            }))
          }
        },
        {
          id: `pred-${Date.now()}-2`,
          question_text: `Evaluate the critical challenges and modern methodologies in ${ws.name}, citing key examples and recent developments.`,
          topic: "Advanced Applications",
          difficulty_level: "challenging",
          recurrence_count: 2,
          years_appeared: [2022, 2020],
          frequency_score: 0.70,
          mark_allocation: 25,
          bookmarked: false,
          is_reviewed: false,
          is_hard: true,
          historical_variants: [
            `2022: Critically assess the methodological trade-offs in modern ${ws.code}.`
          ],
          explanation: {
            grounding_type: "grounded_in_notes",
            grounding_score: 0.88,
            core_concept: `Advanced analysis demands weighing trade-offs and understanding edge cases where standard models require modification.`,
            step_by_step: [
              {
                step: 1,
                title: "Contextual Appraisal",
                description: "Examine assumptions and boundary conditions."
              },
              {
                step: 2,
                title: "Critical Synthesis",
                description: "Compare contemporary empirical studies against traditional consensus."
              }
            ],
            key_takeaways: [
              "Show balanced evaluation of opposing viewpoints.",
              "Conclude with actionable recommendations."
            ],
            pitfalls_to_avoid: [
              "Do not just list facts; provide critical appraisal."
            ],
            cited_sources: (ws.uploads || []).slice(0, 1).map(u => ({
              document_name: u.filename,
              page_number: 12,
              excerpt: `Lecture notes discussing advanced challenges in ${ws.name}.`
            }))
          }
        }
      ];
      ws.predictions = generated;
    }

    this.saveWorkspaces([...this.workspaces]);
    return ws.predictions;
  }
}

export const dataStore = new DataStore();
