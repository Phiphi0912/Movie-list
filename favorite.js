const baseUrl = 'https://movie-list.alphacamp.io'
const indexUrl = baseUrl + '/api/v1/movies/'
const posterUrl = baseUrl + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovie')) || []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

function renderMovieList(data) {
  let rawHtml = ''

  data.forEach((item) => {
    // 需要title, image
    // console.log(item)
    rawHtml += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img class="card-img-top"
              src="${posterUrl + item.image}"
              alt="Movie poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movieModal" data-id="${item.id}" >More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })

  dataPanel.innerHTML = rawHtml
}

function showMovie(id) {
  const movieTitle = document.querySelector('#movie-modal-title')
  const movieImage = document.querySelector('#movie-modal-image')
  const movieDate = document.querySelector('#movie-modal-date')
  const movieDescription = document.querySelector('#movie-modal-description')

  axios.get(indexUrl + id).then(response => {
    const data = response.data.results
    console.log(data)
    movieTitle.innerHTML = data.title
    movieDate.innerHTML = data.release_date
    movieDescription.innerHTML = data.description
    movieImage.innerHTML = `<img src="${posterUrl + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

function removeFavorite (id) {
  function isMovieMatched(movie) {
    return movie.id === id
  }
  
  if (!movies) return //一旦收藏清單是空的，就結束這函式

  const movieIndex = movies.findIndex(isMovieMatched)
  if (movieIndex === -1) return //傳入的電影id 若是在收藏清單中不存在，就結束這函式
  // return console.log(movieIndex)

  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovie', JSON.stringify(movies))
  renderMovieList(movies)
}


dataPanel.addEventListener('click', function dataPanel(event) {
  const target = event.target
  if (target.matches('.btn-show-movie')) {  ``
    // console.log(target.dataset) //dataset 回傳的都會是字串，所以要將ID轉為數字
    showMovie(Number(target.dataset.id))
  } else if (target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(target.dataset.id))
  }
})

renderMovieList(movies)

