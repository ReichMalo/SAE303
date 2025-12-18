import data from "./skill.json";

let pn = Object.values(data);

// Tableau d'association des compétences: nom_court -> index
let competenceIndex = {};
pn.forEach((competence, index) => {
  competenceIndex[competence.nom_court.toLowerCase()] = index;
});

pn.getCompInfo = function (accode) {
}

pn.getLevelIndex = function (accode) {
    return accode.charAt(2);
}

pn.getSkillIndex = function (accode) {
    return accode.charAt(3);
}

pn.getACIndex = function (accode) {
    return accode.charAt(6);
}

pn.getACLibelle = function (accode) {
    let skill = pn.getSkillIndex(accode) - 1;
    let level = pn.getLevelIndex(accode) - 1;
    let ac = pn.getACIndex(accode) - 1;

    return pn[skill].niveaux[level].acs[ac].libelle;
}

pn.getLevelLibelle = function (levelId) {
    const [competenceName, lvlPart] = levelId.split('_lvl');
    const competenceIdx = competenceIndex[competenceName];
    const levelIdx = parseInt(lvlPart) - 1;
    
    if (competenceIdx === undefined) return null;
    
    const competence = pn[competenceIdx];
    const niveau = competence.niveaux[levelIdx];
    
    if (!niveau) return null;
    
    return {
        libelle: niveau.libelle,
        libelle_long: competence.libelle_long
    };
}

export { pn, competenceIndex };
