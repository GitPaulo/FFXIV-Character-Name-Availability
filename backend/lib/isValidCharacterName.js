const CHARACTER_NAME_REGEX = /^[a-zA-Z]+$/;
const MAX_CHARACTER_NAME_LENGTH = 15;
const MIN_CHARACTER_NAME_LENGTH = 2;
const MAX_CHARACTER_NAME_COMBINED_LENGTH = 20;

/**
 * Is the given query a valid FFXIV character name?
 * @param {string} query 
 * @returns boolean
 */
module.exports = (query) => {
  const names = query.split(" ");

  if (names.length !== 2) {
    return false;
  }

  const [firstName, lastName] = names;

  if (
    !CHARACTER_NAME_REGEX.test(firstName) ||
    !CHARACTER_NAME_REGEX.test(lastName)
  ) {
    return false;
  }

  if (
    firstName.length < MIN_CHARACTER_NAME_LENGTH ||
    firstName.length > MAX_CHARACTER_NAME_LENGTH ||
    lastName.length < MIN_CHARACTER_NAME_LENGTH ||
    lastName.length > MAX_CHARACTER_NAME_LENGTH
  ) {
    return false;
  }

  if (firstName.length + lastName.length > MAX_CHARACTER_NAME_COMBINED_LENGTH) {
    return false;
  }

  return true;
}
