import {render, remove} from '../framework/render.js';
import PointPresenter from './point-presenter.js';
import SortView from '../view/sort-view.js';
import EventsListView from '../view/events-list-view.js';
import EmptyView from '../view/empty-view.js';
import { SortType } from '../mocks/const.js';
import { updateItem, sortByDay, sortByPrice } from '../utils.js';

export default class Presenter {
  #pointsListComponent = new EventsListView();
  #emptyListComponent = new EmptyView();
  #sortComponent = new SortView();
  #currentSortType = SortType.DAY;
  #container = null;
  #tripModel = null;
  #pointsList = [];
  #pointPresenter = new Map();

  constructor(container, tripModel) {
    this.#container = container;
    this.#tripModel = tripModel;
  }

  init() {
    this.#pointsList = this.#tripModel.points;
    this.#renderPage();
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter(this.#pointsListComponent.element, this.#handlePointChange, this.#handleModeChange);
    pointPresenter.init(point);
    this.#pointPresenter.set(point.id, pointPresenter);
  }

  #renderEmptyList() {
    render(new this.#emptyListComponent, this.#container);
  }

  #renderSort() {
    this.#sortComponent.setSortTypeChangeHandler(this.#handleSortTypeChange);
    render(this.#sortComponent, this.#container);
  }

  #renderList = () => {
    render(this.#pointsListComponent, this.#container);
    for (let i = 0; i < this.#pointsList.length; i++) {
      this.#renderPoint(this.#pointsList[i]);
    }
  };

  #renderPage() {
    if(this.#pointsList.length === 0) {
      this.#renderEmptyList();
      return;
    }

    this.#renderSort(this.#currentSortType);
    this.#renderList();
  }

  #clearPointList = () => {
    this.#pointPresenter.forEach((presenter) => presenter.destroy());
    this.#pointPresenter.clear();
  };

  #handlePointChange = (updatedPoint) => {
    this.#pointsList = updateItem(this.#pointsList, updatedPoint);
    this.#pointPresenter.get(updatedPoint.id).init(updatedPoint);
  };

  #handleModeChange = () => {
    this.#pointPresenter.forEach((presenter) => presenter.resetView());
  };

  #handleSortTypeChange = (sortType) => {
    if(this.#currentSortType === sortType) {
      return;
    }

    this.#sortPoints(sortType);
    this.#updateSortMarkup();
    this.#clearPointList();
    this.#renderList();
  };

  #sortPoints = (sortType) => {
    switch(sortType) {
      case SortType.DAY:
        this.#pointsList.sort(sortByDay);
        break;
      case SortType.PRICE:
        this.#pointsList.sort(sortByPrice);
        break;
    }
    this.#currentSortType = sortType;
  };

  #updateSortMarkup = () => {
    remove(this.#sortComponent);
    this.#renderSort();
  };
}
