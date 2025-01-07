import classNames from 'classnames';
import { SortBy } from '../../App';

type FooterProps = {
  itemsLeft: number;
  sortBy: string;
  onSortBy: (sort: SortBy) => void;
  onCleanCompleted: (clean: boolean) => void;
  todosLength: number;
};

export function Footer({
  itemsLeft,
  sortBy,
  onSortBy,
  onCleanCompleted,
  todosLength,
}: FooterProps) {
  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {itemsLeft} items left
      </span>
      {/* Active link should have the 'selected' class */}
      <nav className="filter" data-cy="Filter">
        <a
          href="#/"
          className={classNames('filter__link', {
            selected: sortBy === SortBy.All,
          })}
          data-cy="FilterLinkAll"
          onClick={e => {
            e.preventDefault();
            onSortBy(SortBy.All);
          }}
        >
          All
        </a>

        <a
          href="#/active"
          className={classNames('filter__link', {
            selected: sortBy === SortBy.Active,
          })}
          data-cy="FilterLinkActive"
          onClick={e => {
            e.preventDefault();
            onSortBy(SortBy.Active);
          }}
        >
          Active
        </a>

        <a
          href="#/completed"
          className={classNames('filter__link', {
            selected: sortBy === SortBy.Completed,
          })}
          data-cy="FilterLinkCompleted"
          onClick={e => {
            e.preventDefault();
            onSortBy(SortBy.Completed);
          }}
        >
          Completed
        </a>
      </nav>
      {/* this button should be disabled if there are no completed todos */}
      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={todosLength !== itemsLeft ? false : true}
        onClick={() => onCleanCompleted(true)}
      >
        Clear completed
      </button>
    </footer>
  );
}
