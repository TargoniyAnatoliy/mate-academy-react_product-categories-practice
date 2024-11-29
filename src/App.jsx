/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const users = [...usersFromServer];
const categories = [...categoriesFromServer];
const products = productsFromServer.map(product => {
  const category = categories.find(cat => cat.id === product.categoryId);
  const owner = users.find(user => user.id === category.ownerId);

  return {
    ...product,
    category,
    owner,
  };
});

function filterProducts(productsArr, query, userFilter, categoriesFilter) {
  const filteredProducts = [...productsArr]
    .filter(product => {
      return userFilter === 'all' ? true : product.owner.id === userFilter;
    })
    .filter(product => {
      return query !== ''
        ? product.name.toLowerCase().includes(query.toLowerCase())
        : true;
    })
    .filter(product => {
      return categoriesFilter.length === 0
        ? true
        : categoriesFilter.includes(product.categoryId);
    });

  return filteredProducts;
}

export const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const setCategoriesFilter = categoryId => () => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedUser('all');
  };

  const sortProductBy = field => () => {
    setSortField(field);

    if (field !== sortField) {
      setSortOrder('asc');
    } else {
      setSortOrder(sortOrder === 'asc' ? 'desc' : null);
    }
  };

  let productsToShow = filterProducts(
    products,
    searchQuery,
    selectedUser,
    selectedCategories,
  ).toSorted((product1, product2) => {
    switch (sortField) {
      case 'id':
        return product1.id - product2.id;
      case 'productName':
        return product1.name.localeCompare(product2.name);
      case 'productCategory':
        return product1.category.title.localeCompare(product2.category.title);
      case 'owner':
        return product1.owner.name.localeCompare(product2.owner.name);
      default:
        return 0;
    }
  });

  if (sortOrder === 'desc') {
    productsToShow = productsToShow.toReversed();
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                onClick={() => setSelectedUser('all')}
                className={selectedUser === 'all' ? 'is-active' : null}
              >
                All
              </a>

              {users.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  onClick={() => {
                    setSelectedUser(user.id);
                  }}
                  className={selectedUser === user.id ? 'is-active' : null}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>
                {searchQuery !== '' && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setSearchQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={`button is-success mr-6 ${selectedCategories.length === 0 ? 'is-info' : 'is-outlined'}`}
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>

              {categories.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={`button mr-2 my-1 ${selectedCategories.includes(category.id) ? 'is-info' : null}`}
                  href="#/"
                  onClick={setCategoriesFilter(category.id)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={resetAllFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {productsToShow.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead key="productTable-th">
                <tr>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID
                      <a href="#/" onClick={sortProductBy('id')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn(
                              'fas',
                              {
                                'fa-sort':
                                  sortField !== 'id' || sortOrder == null,
                              },
                              {
                                'fa-sort-up':
                                  sortField === 'id' && sortOrder === 'asc',
                              },
                              {
                                'fa-sort-down':
                                  sortField === 'id' && sortOrder === 'desc',
                              },
                            )}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product
                      <a href="#/" onClick={sortProductBy('productName')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn(
                              'fas',
                              {
                                'fa-sort':
                                  sortField !== 'productName' ||
                                  sortOrder == null,
                              },
                              {
                                'fa-sort-up':
                                  sortField === 'productName' &&
                                  sortOrder === 'asc',
                              },
                              {
                                'fa-sort-down':
                                  sortField === 'productName' &&
                                  sortOrder === 'desc',
                              },
                            )}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category
                      <a href="#/" onClick={sortProductBy('productCategory')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn(
                              'fas',
                              {
                                'fa-sort':
                                  sortField !== 'productCategory' || sortOrder == null,
                              },
                              {
                                'fa-sort-up':
                                  sortField === 'productCategory' && sortOrder === 'asc',
                              },
                              {
                                'fa-sort-down':
                                  sortField === 'productCategory' && sortOrder === 'desc',
                              },
                            )}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User
                      <a href="#/" onClick={sortProductBy('owner')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn(
                              'fas',
                              {
                                'fa-sort':
                                  sortField !== 'owner' || sortOrder == null,
                              },
                              {
                                'fa-sort-up':
                                  sortField === 'owner' && sortOrder === 'asc',
                              },
                              {
                                'fa-sort-down':
                                  sortField === 'owner' && sortOrder === 'desc',
                              },
                            )}
                          />
                        </span>
                      </a>
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody key="productTable-body">
                {productsToShow.map(product => (
                  <tr data-cy="Product" key={product.id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {product.category.icon} - {product.category.title}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={
                        product.owner.sex === 'm'
                          ? 'has-text-link'
                          : 'has-text-danger'
                      }
                    >
                      {product.owner.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
