export interface Leader {
  slug: string
  role: string
  honorific?: string
  name: string
  credentials?: string
  photo: string
  phone?: string
  email?: string
  message: string[]
}

export const leaders: Record<string, Leader> = {
  correspondent: {
    slug: "correspondent",
    role: "Correspondent",
    honorific: "Hon'ble Correspondent",
    name: "Smt. K. Rajeswari",
    email: "ksrmcekadapa@gmail.com",
    photo: "/images/leadership/correspondent.jpg",
    message: [
      "The college was started with a noble cause to provide technical education to people of the Rayalaseema region, one of the backward regions of Andhra Pradesh, and has been doing well per its founding motivation. KSRMCE has produced noteworthy alumni since 1980, aiming to produce mature, professionally equipped graduates with values, morals and ethics through academics and co-curricular activities.",
      "We believe in academic excellence by upholding teaching-learning standards through capable human resources and adopting contemporary technologies. Our faculty and infrastructure are designed to nurture critical thinking and problem-solving abilities in our students.",
      "Beyond academics, we focus on instilling ethics, values and morals among our students. We are committed to developing not just technocrats, but responsible global citizens who contribute meaningfully to society and the nation.",
    ],
  },

  "managing-director": {
    slug: "managing-director",
    role: "Managing Director",
    name: "Dr. K. Chandra Obul Reddy",
    credentials: "Managing Director & Vice Chairman, Kandula Group of Institutions",
    photo: "/images/leadership/correspondent.jpg",
    message: [
      "I am the youngest and most energetic Managing Director of the Kandula Group of Institutions and Vice Chairman of KSRMCE. As an entrepreneur who founded KOR Ginning & Oil Mills Pvt Ltd, I understand the importance of innovation and excellence in every endeavor.",
      "I serve as Director of three organizations: Kandula Group of Institutions, KOR Ginning and Oil Mills Pvt Ltd, and Kandula Ginning and Pressing Mills Pvt Ltd. Taking over to continue the legacy of my father and grandfather is both a responsibility and a privilege that I cherish deeply.",
      "My passion is providing high-quality education that equips our students with knowledge, skills, and values. I believe that education is the cornerstone of progress, and KSRMCE remains committed to fostering excellence across all our institutions.",
    ],
  },

  chairman: {
    slug: "chairman",
    role: "Chairman",
    name: "Sri. K. Madan Mohan Reddy",
    credentials: "Master of Science (USA)",
    email: "ksrmcekadapa@gmail.com",
    photo: "/images/leadership/correspondent.jpg",
    message: [
      "The institute is dedicated to helping students flourish with advanced technological knowledge in their fields. We have invested in state-of-the-art laboratories and facilities to convert theory into experimental outcomes, ensuring our students gain practical expertise alongside theoretical understanding.",
      "Our motive is not only to prepare technocrats but to make them ideal people who serve society and the nation with regularity, responsibility and dedication. Education, in our view, is a holistic process that develops both mind and character.",
    ],
  },

  principal: {
    slug: "principal",
    role: "Principal",
    name: "Dr. T. Nageswara Prasad",
    credentials: "M.Tech., Ph.D.",
    phone: "+91 90003 32294",
    email: "principal@ksrmce.ac.in",
    photo: "/images/leadership/correspondent.jpg",
    message: [
      "Welcome to KSRMCE, an institution of excellence under Kandula Obul Reddy Charities. Since 1980, we have produced quality technical graduates for the country and the world, maintaining our commitment to academic rigor and ethical development.",
      "Over four decades, we have become a premier hub of learning blending state-of-the-art infrastructure with committed faculty, fostering knowledge while instilling human values and social responsibility. Our campus is a vibrant ecosystem where innovation thrives alongside tradition.",
      "We prioritize interdisciplinary research, experiential learning and outcome-based education (OBE), giving our students critical thinking, skill development, analytical, entrepreneurial and leadership skills for a globalized world. Our curriculum is continuously updated to reflect industry trends and technological advancements.",
      "Beyond the classroom, KSRMCE offers extracurricular and co-curricular activities through technical clubs, cultural events, sports and volunteer work. We develop capable engineers who are also morally upright global citizens, ready to contribute to a better future.",
    ],
  },
}

export const leadershipOrder: string[] = ["correspondent", "managing-director", "chairman", "principal"]
