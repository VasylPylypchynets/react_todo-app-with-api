import classNames from 'classnames';

type FooterProps = {
  itemsLeft: number;
  sortBy: string;
  onSortBy: (sort: string) => void;
  onCleanCompleted: () => void;
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
          className={classNames('filter__link', { selected: sortBy === 'all' })}
          data-cy="FilterLinkAll"
          onClick={e => {
            e.preventDefault();
            onSortBy('all');
          }}
        >
          All
        </a>

        <a
          href="#/active"
          className={classNames('filter__link', {
            selected: sortBy === 'active',
          })}
          data-cy="FilterLinkActive"
          onClick={e => {
            e.preventDefault();
            onSortBy('active');
          }}
        >
          Active
        </a>

        <a
          href="#/completed"
          className={classNames('filter__link', {
            selected: sortBy === 'completed',
          })}
          data-cy="FilterLinkCompleted"
          onClick={e => {
            e.preventDefault();
            onSortBy('completed');
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
        onClick={onCleanCompleted}
      >
        Clear completed
      </button>
    </footer>
  );
}
