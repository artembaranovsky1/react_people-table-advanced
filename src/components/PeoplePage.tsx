import { PeopleFilters } from './PeopleFilters';
import { Loader } from './Loader';
import { PeopleTable } from './PeopleTable';
import { useEffect, useState } from 'react';
import { Person } from '../types';
import { getPeople } from '../api';
import { useSearchParams } from 'react-router-dom';

export const PeoplePage = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();

  const sex = searchParams.get('sex') || null;
  const centuries = searchParams.getAll('centuries');
  const query = searchParams.get('query') || '';

  const sortBy = searchParams.get('sort') || '';

  console.log(sortBy);

  const sortedPeople = [...people].sort((a, b) =>
    String(a[sortBy as keyof Person]).localeCompare(
      String(b[sortBy as keyof Person]),
    ),
  );

  const filteredPeople = sortedPeople.filter(person => {
    const matchesSex = !sex || person.sex === sex;

    const selectedCenturies = centuries.map(Number);
    const personCentury = Math.ceil(person.born / 100);

    const matchesQuery = !query || person.name.includes(query);

    const matchesCentury =
      selectedCenturies.length === 0 ||
      selectedCenturies.includes(personCentury);

    return matchesSex && matchesCentury && matchesQuery;
  });

  // const sortedFilteredPeople = [...filteredPeople].sort((a, b) =>
  //   String(a[sortBy as keyof Person]).localeCompare(
  //     String(b[sortBy as keyof Person]),
  //   ),
  // );

  useEffect(() => {
    setLoading(true);

    getPeople()
      .then(data => setPeople(data))
      .catch(() => setErrorMessage('Something went wrong'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1 className="title">People Page</h1>

      <div className="block">
        <div className="columns is-desktop is-flex-direction-row-reverse">
          {!loading && !errorMessage && people.length > 0 && (
            <div className="column is-7-tablet is-narrow-desktop">
              <PeopleFilters />
            </div>
          )}

          <div className="column">
            <div className="box table-container">
              {loading && <Loader />}

              {!loading && !errorMessage && filteredPeople.length > 0 && (
                <PeopleTable people={filteredPeople} />
              )}

              {!loading && !errorMessage && filteredPeople.length === 0 && (
                <p>There are no people matching the current search criteria</p>
              )}

              {!loading && !errorMessage && people.length === 0 && (
                <p data-cy="noPeopleMessage">
                  There are no people on the server
                </p>
              )}
              {!loading && errorMessage && (
                <p data-cy="peopleLoadingError" className="has-text-danger">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
