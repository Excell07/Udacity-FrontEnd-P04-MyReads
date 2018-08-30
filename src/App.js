import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import * as BooksAPI from './utils/BooksAPI'
import CompHeader from './CompHeader'
import CompMain from './CompMain'
import CompHeaderAddBooks from './CompHeaderAddBooks'
import CompAddBooks from './CompAddBooks'
import CompFooter from './CompFooter'
import CompLoading from './CompLoading'

class App extends Component {
  state = {
    myReads: [],
    loading: false
  }
  componentDidMount() {
    // Try to get data from localStorage or from BooksAPI
    (!localStorage.getItem('myReadsLocal')) ?
    this.myBooks() :
    this.setState({
      myReads: JSON.parse(localStorage.getItem('myReadsLocal')),
      loading: true
    })
  }
  componentDidUpdate(prevState) {
    // Update the localStorage on changes
    (this.state.myReads !== prevState.myReads) &&
    localStorage.setItem('myReadsLocal', JSON.stringify(this.state.myReads))
  }
  /*
   Create the first shelf from selected books
  */
  myBooks() {
    const currentlyReading = ['mDzDBQAAQBAJ', '_hIWb6Z8mX0C', 'luD1Bpc1fmsC']
    const wantToRead = ['3_PhCwAAQBAJ', 'piwP9HXtpvUC', 'QlduAgAAQBAJ', 'MjhaAAAAMAAJ']
    const read = ['BjDuAAAAMAAJ', 'JvOTGx2S6UgC', 'pqHfBQAAQBAJ', 'ZTOtnZg_j3gC', 'a_fSBAAAQBAJ']
    this.fetchBooks(wantToRead, 'wantToRead')
    this.fetchBooks(currentlyReading, 'currentlyReading')
    this.fetchBooks(read, 'read')
  }
  /*
   Fetch the chosen books to a specific shelf
  */
  fetchBooks(books, shelf) {
    books.map((book) => {
      return (
        BooksAPI.get(book).then((resp) => {
          const obj = {
            book: resp.book,
            stars: 0
          }
          return obj
        }).then((resp) => {
          let list = []
          resp.book.shelf = shelf
          list.push(resp)
          return list
        }).then((resp) => {
          this.setState((prevState) => ({
            myReads: prevState.myReads.concat(resp),
            loading: true
          }))
        })
      )
    })
  }
  /*
   Function to add star rating
  */
  rating = (num, item) => {
    item.stars = num
    this.setState({
      myReads: this.state.myReads
    })
  }
  /*
   Move the current selected book to another shelf
  */
  move = (shelf, item) => {
    // prevent overlay mess
    document.querySelectorAll('.bookOverlay')
    .forEach(el => el.style.display = 'none')
    // apply the chosen shelf
    item.book.shelf = shelf
    // prevent duplicates
    const filtered = this.state.myReads.filter((el) => el.book.id !== item.book.id)
    shelf !== 'none' && filtered.push(item)

    this.setState({
      myReads: filtered
    })
  }
  render() {
    if(this.state.loading === false) {
      return <CompLoading/>
    } else {
      return (
        <div id="myReads">
          <Route exact path={process.env.PUBLIC_URL + '/'} render={() => (
            <CompHeader/>
          )}/>
          <Route exact path={process.env.PUBLIC_URL + '/'} render={() => (
            <CompMain
              myReads={this.state.myReads}
              moveTo={this.move}
              addStar={this.rating}
            />
          )}/>
          <Route path={process.env.PUBLIC_URL + '/addBooks'} render={() => (
            <CompHeaderAddBooks/>
          )}/>
          <Route path={process.env.PUBLIC_URL + '/addBooks'} render={() => (
            <CompAddBooks
              myReads={this.state.myReads}
              moveTo={this.move}
            />
          )}/>
          <CompFooter/>
        </div>
      );
    }
  }
}

export default App;