/**
 * The college's leadership, in their own published words.
 *
 * This previously existed twice over - as summaries on the About page and again
 * as longer bios on each profile page - and neither copy was the college's own
 * text; both were prose written for the rebuild. The wording below is carried
 * over verbatim from the messages published on the previous site, and is
 * defined once here so a card and its profile can never disagree.
 *
 * The first paragraph doubles as the card summary; the profile shows them all.
 */

export interface Leader {
  /** URL segment under /about/. */
  slug: string
  name: string
  role: string
  photo: string
  /**
   * Shown on the profile page, for offices the public needs to reach.
   *
   * The leaders below deliberately carry none: the college asked for their
   * addresses to come off the site. This used to be a dead `email` field that
   * still held all four addresses but was rendered nowhere - one edit away
   * from putting them back by accident - so the addresses are gone rather
   * than merely hidden.
   */
  email?: string
  /** Digits as the college gave them; formatted for display, dialled as-is. */
  phone?: string
  /** A line above the message, where the college published one. */
  credential?: string
  /** Heading the profile page puts over the message. */
  messageHeading: string
  /**
   * A quotation mark sits above a person's own message. Offices described in
   * the third person set this false, since nothing there is being quoted.
   */
  showQuoteMark?: boolean
  paragraphs: string[]
}

export const LEADERSHIP: Leader[] = [
  {
    slug: "correspondent",
    name: "Smt. K. Rajeswari",
    // Published as "Secretary cum Correspondent"; the college asked for "and"
    // in place of "cum", keeping both titles.
    role: "Correspondent and Secretary",
    photo: "/images/leadership/correspondent.jpg",
    messageHeading: "Correspondent's Message",
    paragraphs: [
      "The college was started with a noble cause to provide Technical Education to the people in the Rayalaseema region, one of the backward regions, of Andhra Pradesh. The college has been doing well in accordance with the motivation behind it's establishment. KSRMCE has produced noteworthy alumni since it's existence from 1980. The institute aims to produce potentially matured, professionally equipped graduates with values, morals and ethics and has been striving to achieve through the academics, extra and co-curricular activities.",
      "We strongly believe in academic excellence by up-holding teaching-learning standards through potential human resources and by adopting technologies. Thus, in this process, we have not left any stone unturned.",
      "We believe that “A person without culture is a strange animal”. We focus on instilling ethics, values and morals amongst our staff and students apart from imparting education. We also believe that physical and mental strength are equally important for our staff and students. The college is providing all facilities and conducting programs for physical and mental well-being.",
    ],
  },
  {
    slug: "chairman",
    name: "Sri K. Madan Mohan Reddy",
    role: "Chairman",
    photo: "/images/leadership/chairman.webp",
    credential: "Master of Science, United States of America",
    messageHeading: "Chairman's Message",
    paragraphs: [
      "The institute with its heart and soul is always dedicated and determined to flourish and blossom its students with advanced technological aspects in their respective field by providing them state of the art laboratories to convert their obtained theoretical concepts from their research oriented faculty into experimental outcomes.",
      "As a matter of course, our motive is to not only prepare our students as technocrats but to make them ideal people who can serve the society and the nation with utmost of regularity, responsibility and rapture.",
    ],
  },
  {
    slug: "managing-director",
    name: "Dr. K. Chandra Obul Reddy",
    role: "Vice Chairman & Managing Director",
    photo: "/images/leadership/managing-director.webp",
    messageHeading: "About the Managing Director",
    paragraphs: [
      "Dr. K. Chandra Obul Reddy Garu is the Kandula Group of Institutions' youngest and most energetic Managing Director and Vice Chairman of K.S.R.M. College of Engineering. He is an entrepreneur. He founded KOR Ginning & Oil Mills Private Limited. He is the Director of three organizations: the Kandula Group of Institutions, KOR Ginning and Oil Mills Private Limited, and Kandula Ginning and Pressing Mills Private Limited.",
      "He took over as Managing Director of the Kandula Group of Institutions to continue on the legacy of his father and grandfather. He is really passionate about giving high-quality education.",
      "He is working hard to internalize his vision and objectives, as well as to develop the institute's infrastructure-wise for all-round development of the stakeholders.",
      "Under his capable leadership, the Kandula Group of Institutions is flourishing in all areas.",
    ],
  },
  {
    slug: "principal",
    name: "Dr. T. Nageswara Prasad",
    role: "Principal",
    photo: "/images/leadership/principal.png",
    messageHeading: "Principal's Message",
    paragraphs: [
      "It is my pleasure to welcome you to K.S.R.M. College of Engineering (KSRMCE), an institution of excellence under the Kandula Obula Reddy Charities. Since its inception, in 1980, KSRMCE has shown its impact on producing quality technical graduates not only to the country but also the world.",
      "Over the past four decades, KSRMCE has transformed into a premier hub of learning, blending state-of-the-art infrastructure with unique human resource deeply committed imparting quality technical education. We take pride in fostering an ecosystem of knowledge assimilation, generation, and dissemination while instilling strong human values and a deep sense of social responsibility.",
      "At KSRMCE, we prioritize interdisciplinary research, experiential learning, and outcome-based education (OBE). In addition to giving students a solid academic foundation, our program aims to provide them the critical thinking, skill-development, analytical frameworks, entrepreneurial, and leadership skills they need to succeed in a fast-paced, globalized world.",
      "Beyond the classroom, KSRMCE offers a comprehensive education with lots of chances for extracurricular and co-curricular activities. Through technical clubs, cultural events, games/sports, and volunteer work, students are encouraged to discover their abilities and develop into not only capable engineers but also morally upright global citizens.",
    ],
  },
  {
    slug: "finance-officer",
    // Spelt as on the Finance Committee, where he is listed as Accounts Manager.
    name: "Sri K. Jayanarasimhulu",
    role: "Finance Officer",
    photo: "/images/leadership/Jayanarasimhulu.jpeg",
    email: "manageraccounts@ksrmce.ac.in",
    phone: "8919181206",
    messageHeading: "The Office of the Finance Officer",
    // An office, not a published message - so no quotation mark over it.
    showQuoteMark: false,
    // PLACEHOLDER: unlike every other entry here, this text is not the
    // college's own published wording - there is none to carry over. It
    // describes the office rather than the person, so it states nothing about
    // him that could be wrong. Replace it with the college's wording when they
    // supply it.
    paragraphs: [
      "The Finance Officer is responsible for the financial administration of the college - fee collection and receipts, scholarship disbursement, salary and vendor payments, budgeting, and the statutory audits the institution completes each year.",
      "Students and parents may contact this office about fee payment and receipts, refunds, scholarship claims under State and Central schemes, and the bonafide and fee-structure certificates required for admission, education loan or scholarship purposes.",
      "The office works with the Finance Committee of the college in planning the annual budget, and in seeing that the funds allotted to the academic departments, laboratories, the library and student activities are used for the purpose for which they were sanctioned.",
    ],
  },
]

export function leaderBySlug(slug: string): Leader | undefined {
  return LEADERSHIP.find((l) => l.slug === slug)
}
