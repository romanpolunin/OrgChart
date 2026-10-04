/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 */

import type { ChartDataItem, ChartDataSource } from "../src/data-source";

export interface Person extends ChartDataItem {
  parentId: string | null;
  name: string;
  title: string;
  team: string;
  isAssistant: boolean;
}

/** A small company, ordered so siblings appear left to right. */
export const STUDIO: Person[] = [
  { id: "n01", parentId: null, name: "Elena Voss", title: "Chief Executive", team: "Office", isAssistant: false },
  { id: "n02", parentId: "n01", name: "Mateo Ruiz", title: "Executive Assistant", team: "Office", isAssistant: true },
  { id: "n03", parentId: "n01", name: "Helen Cho", title: "Chief of Staff", team: "Office", isAssistant: true },
  { id: "n04", parentId: "n01", name: "Amir Shah", title: "VP Engineering", team: "Engineering", isAssistant: false },
  { id: "n05", parentId: "n04", name: "Sofia Berg", title: "Engineering Coordinator", team: "Engineering", isAssistant: true },
  { id: "n06", parentId: "n04", name: "Noah Keller", title: "Director of Platform", team: "Platform", isAssistant: false },
  { id: "n07", parentId: "n06", name: "Ida Holm", title: "Staff Engineer", team: "Platform", isAssistant: false },
  { id: "n08", parentId: "n06", name: "Kenji Sato", title: "Senior Engineer", team: "Platform", isAssistant: false },
  { id: "n09", parentId: "n06", name: "Rosa Alvarez", title: "Engineer", team: "Platform", isAssistant: false },
  { id: "n10", parentId: "n06", name: "Peter Walsh", title: "Engineer", team: "Platform", isAssistant: false },
  { id: "n11", parentId: "n06", name: "Mina Farouk", title: "Site Reliability Engineer", team: "Platform", isAssistant: false },
  { id: "n12", parentId: "n04", name: "Aisha Rahman", title: "Director of Product Engineering", team: "Product", isAssistant: false },
  { id: "n13", parentId: "n12", name: "Leo Martins", title: "Staff Engineer", team: "Product", isAssistant: false },
  { id: "n14", parentId: "n12", name: "Hannah Bergstrom", title: "Senior Engineer", team: "Product", isAssistant: false },
  { id: "n15", parentId: "n12", name: "Chris Doyle", title: "Engineer", team: "Product", isAssistant: false },
  { id: "n16", parentId: "n12", name: "Yara Haddad", title: "Engineer", team: "Product", isAssistant: false },
  { id: "n17", parentId: "n04", name: "Lars Eriksen", title: "Director of Quality", team: "Quality", isAssistant: false },
  { id: "n18", parentId: "n17", name: "Nina Petrova", title: "QA Lead", team: "Quality", isAssistant: false },
  { id: "n19", parentId: "n17", name: "Omar Farhi", title: "Test Engineer", team: "Quality", isAssistant: false },
  { id: "n20", parentId: "n17", name: "Elise Moreau", title: "Test Engineer", team: "Quality", isAssistant: false },
  { id: "n21", parentId: "n01", name: "Camille Bernard", title: "VP Design", team: "Design", isAssistant: false },
  { id: "n22", parentId: "n21", name: "Jun Park", title: "Design Operations", team: "Design", isAssistant: true },
  { id: "n23", parentId: "n21", name: "Freya Lind", title: "Design Director", team: "Design", isAssistant: false },
  { id: "n24", parentId: "n23", name: "Sam Okoye", title: "Product Designer", team: "Design", isAssistant: false },
  { id: "n25", parentId: "n23", name: "Lena Vogel", title: "Product Designer", team: "Design", isAssistant: false },
  { id: "n26", parentId: "n23", name: "Hugo Ferreira", title: "Brand Designer", team: "Design", isAssistant: false },
  { id: "n27", parentId: "n01", name: "Andrej Nowak", title: "VP Revenue", team: "Revenue", isAssistant: false },
  { id: "n28", parentId: "n27", name: "Priya Nair", title: "Sales Operations", team: "Revenue", isAssistant: true },
  { id: "n29", parentId: "n27", name: "Maya Chen", title: "Account Director", team: "Revenue", isAssistant: false },
  { id: "n30", parentId: "n27", name: "Ben Adler", title: "Account Director", team: "Revenue", isAssistant: false },
  { id: "n31", parentId: "n27", name: "Sara Iqbal", title: "Account Executive", team: "Revenue", isAssistant: false },
  { id: "n32", parentId: "n27", name: "Tom Becker", title: "Account Executive", team: "Revenue", isAssistant: false },
  { id: "n33", parentId: "n27", name: "Lila Costa", title: "Account Executive", team: "Revenue", isAssistant: false },
  { id: "n34", parentId: "n27", name: "Owen Briggs", title: "Account Executive", team: "Revenue", isAssistant: false },
  { id: "n35", parentId: "n27", name: "Nadia Popescu", title: "Account Executive", team: "Revenue", isAssistant: false },
  { id: "n36", parentId: "n01", name: "Grace Adeyemi", title: "VP People", team: "People", isAssistant: false },
  { id: "n37", parentId: "n36", name: "Ruth Keller", title: "People Partner", team: "People", isAssistant: false },
  { id: "n38", parentId: "n36", name: "Ivan Petrov", title: "People Partner", team: "People", isAssistant: false },
  { id: "n39", parentId: "n36", name: "Chloe Martin", title: "Recruiter", team: "People", isAssistant: false },
  { id: "n40", parentId: "n01", name: "Owen Blake", title: "General Counsel", team: "Legal", isAssistant: false },
  { id: "n41", parentId: "n40", name: "Ana Silva", title: "Counsel", team: "Legal", isAssistant: false },
  { id: "n42", parentId: "n40", name: "David Cohen", title: "Counsel", team: "Legal", isAssistant: false },
];

/** Preserves list order, which is the sibling order. */
export class PersonSource implements ChartDataSource {
  private readonly byId: Map<string, Person>;

  constructor(readonly people: readonly Person[]) {
    this.byId = new Map(people.map((person) => [person.id, person]));
  }

  get allDataItemIds(): string[] {
    return this.people.map((person) => person.id);
  }

  getParentKey(itemId: string): string | null {
    return this.require(itemId).parentId;
  }

  getDataItem(itemId: string): Person {
    return this.require(itemId);
  }

  private require(itemId: string): Person {
    const person = this.byId.get(itemId);
    if (person == null) {
      throw new Error(`Unknown person ${itemId}`);
    }
    return person;
  }
}
