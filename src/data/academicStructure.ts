// Centralized academic registry for ELEX DAVV (IMTech + BSc Electronics)
// This is the ONLY source of truth for all courses, semesters, and subjects

export type CourseKey = 'bsc' | 'imtech';
export type SemesterKey = `sem_${1|2|3|4|5|6|7|8|9|10}`;

export interface SubjectInfo {
  code: string;
  name: string;
}

export const academicStructure: Record<CourseKey, Record<SemesterKey, SubjectInfo[]>> = {
  bsc: {
    sem_1: [
      { code: "EL11102", name: "Mathematics - I" },
      { code: "EL11103", name: "Basic Circuit Theory & Network Analysis" },
      { code: "EL11106", name: "Digital Electronics" },
      { code: "EL11105", name: "C Programming" },
      { code: "EL11104", name: "Communicative English and Technical Writing" }
    ],
    sem_2: [
      { code: "EL12102", name: "Mathematics II: Set theory, Matrix theory, Integral Calculus" },
      { code: "EL12105", name: "Data Structures" },
      { code: "EL12103", name: "Semiconductor Device Physics & Application" },
      { code: "EL12106", name: "Fundamental of Economics" },
      { code: "EL12401", name: "Student Seminar" }
    ],
    sem_3: [
      { code: "EL13101", name: "Analog Electronics and Op-Amp" },
      { code: "EL13102", name: "Java Programming" },
      { code: "EL13105", name: "Introduction to PCB Design" },
      { code: "EL13103", name: "Mathematics III - Probability & Statistics" },
      { code: "EL13104", name: "Electromagnetic Theory" },
      { code: "EL13109", name: "Introduction to Operating Systems" }
    ],
    sem_4: [
      { code: "EL14101", name: "Computer Architecture & Organization" },
      { code: "EL14102", name: "Data Communication & Computer Network" },
      { code: "EL14103", name: "Signal & Systems" },
      { code: "EL14105", name: "Python Programming" },
      { code: "EL14108", name: "Mathematics IV - Real Analysis" }
    ],
    sem_5: [
      { code: "EL15101", name: "Microprocessors & Interfacing" },
      { code: "EL15102", name: "Analog & Digital Communication" },
      { code: "EL15191", name: "MOOC/Other Subject" },
      { code: "EL15104", name: "Control Systems" },
      { code: "EL15109", name: "FPGA Design using Verilog" }
    ],
    sem_6: [
      { code: "EL16101", name: "Embedded Microcontrollers" },
      { code: "EL16103", name: "Wireless and Mobile Communication" },
      { code: "EL16104", name: "AI and Machine Learning" },
      { code: "EL16102", name: "Database Management System" }
    ],
    // BSc Electronics only goes up to sem_6, so we fill these with empty arrays for typescript completeness
    sem_7: [],
    sem_8: [],
    sem_9: [],
    sem_10: []
  },
  imtech: {
    sem_1: [
      { code: "EL11102", name: "Mathematics - I" },
      { code: "EL11103", name: "Basic Circuit Theory & Network Analysis" },
      { code: "EL11106", name: "Digital Electronics" },
      { code: "EL11105", name: "C Programming" },
      { code: "EL11104", name: "Communicative English and Technical Writing" }
    ],
    sem_2: [
      { code: "EL12102", name: "Mathematics II: Set theory, Matrix theory, Integral Calculus" },
      { code: "EL12105", name: "Data Structures" },
      { code: "EL12103", name: "Semiconductor Device Physics & Application" },
      { code: "EL12106", name: "Fundamental of Economics" },
      { code: "EL12401", name: "Student Seminar" }
    ],
    sem_3: [
      { code: "EL13101", name: "Analog Electronics and Op-Amp" },
      { code: "EL13102", name: "Java Programming" },
      { code: "EL13105", name: "Introduction to PCB Design" },
      { code: "EL13103", name: "Mathematics III - Probability & Statistics" },
      { code: "EL13104", name: "Electromagnetic Theory" },
      { code: "EL13109", name: "Introduction to Operating Systems" }
    ],
    sem_4: [
      { code: "EL14101", name: "Computer Architecture & Organization" },
      { code: "EL14102", name: "Data Communication & Computer Network" },
      { code: "EL14103", name: "Signal & Systems" },
      { code: "EL14105", name: "Python Programming" },
      { code: "EL14108", name: "Mathematics IV - Real Analysis" }
    ],
    sem_5: [
      { code: "EL15101", name: "Microprocessors & Interfacing" },
      { code: "EL15102", name: "Analog & Digital Communication" },
      { code: "EL15191", name: "MOOC/Other Subject" },
      { code: "EL15104", name: "Control Systems" },
      { code: "EL15109", name: "FPGA Design using Verilog" }
    ],
    sem_6: [
      { code: "EL16101", name: "Embedded Microcontrollers" },
      { code: "EL16103", name: "Wireless and Mobile Communication" },
      { code: "EL16104", name: "AI and Machine Learning" },
      { code: "EL16102", name: "Database Management System" }
    ],
    sem_7: [
      { code: "EL17105", name: "Wireless and Networking Protocols" },
      { code: "EL17102", name: "Digital Signal Processing" },
      { code: "EL17103", name: "Embedded Systems Design" },
      { code: "EL17104", name: "Linux Scripting and Networking" },
      { code: "EL17191", name: "MOOC" }
    ],
    sem_8: [
      { code: "EL18101", name: "VLSI Design Methodologies" },
      { code: "EL18102", name: "Advanced Embedded Microcontroller - ARM" },
      { code: "EL18103", name: "Real Time Systems" },
      { code: "EL18104", name: "IoT Fundamentals and Applications" },
      { code: "EL18501", name: "Minor Project" }
    ],
    sem_9: [
      { code: "EL19501", name: "Major Project Phase - I" }
    ],
    sem_10: [
      { code: "EL19501", name: "Major Project Phase - II" }
    ]
  }
};

// Fuzzy matching helper
export function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const t = target.toLowerCase().replace(/\s+/g, "");
  
  if (t.includes(q) || q.includes(t)) return true;
  
  let matches = 0;
  let tIndex = 0;
  for (let i = 0; i < q.length && tIndex < t.length; i++) {
    if (q[i] === t[tIndex]) {
      matches++;
      tIndex++;
    } else {
      if (tIndex + 1 < t.length && q[i] === t[tIndex + 1]) {
        matches++;
        tIndex += 2;
      }
    }
  }
  
  return matches >= q.length * 0.6;
}

export interface DetailedSubject {
  code: string;
  name: string;
  semester: number;
  courses: CourseKey[];
}

// Find subject by code and return detailed info
export function findSubjectByCode(code: string): DetailedSubject | null {
  let subjectInfo: SubjectInfo | null = null;
  const courses: CourseKey[] = [];
  let semesterNum = 1;

  for (const course of ['imtech', 'bsc'] as CourseKey[]) {
    const semMap = academicStructure[course];
    for (const semKey of Object.keys(semMap) as SemesterKey[]) {
      const list = semMap[semKey];
      if (!list) continue;
      const found = list.find(s => s.code === code);
      if (found) {
        subjectInfo = found;
        if (!courses.includes(course)) {
          courses.push(course);
        }
        semesterNum = parseInt(semKey.replace('sem_', ''));
      }
    }
  }

  if (subjectInfo) {
    return {
      code: subjectInfo.code,
      name: subjectInfo.name,
      semester: semesterNum,
      courses
    };
  }

  return null;
}

// Search subjects across the whole registry
export function searchSubjects(query: string): DetailedSubject[] {
  if (!query.trim()) return [];
  
  const resultsMap = new Map<string, DetailedSubject>();

  for (const course of ['imtech', 'bsc'] as CourseKey[]) {
    const semMap = academicStructure[course];
    for (const semKey of Object.keys(semMap) as SemesterKey[]) {
      const list = semMap[semKey];
      if (!list) continue;
      for (const s of list) {
        if (fuzzyMatch(query, s.name) || fuzzyMatch(query, s.code)) {
          const existing = resultsMap.get(s.code);
          const semesterNum = parseInt(semKey.replace('sem_', ''));
          if (existing) {
            if (!existing.courses.includes(course)) {
              existing.courses.push(course);
            }
          } else {
            resultsMap.set(s.code, {
              code: s.code,
              name: s.name,
              semester: semesterNum,
              courses: [course]
            });
          }
        }
      }
    }
  }

  return Array.from(resultsMap.values());
}

// Did you mean helper
export function getDidYouMean(query: string): string | null {
  const results = searchSubjects(query);
  if (results.length > 0) {
    const q = query.toLowerCase();
    const exact = results.find((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
    if (!exact && results.length > 0) {
      return results[0].name;
    }
  }
  return null;
}
