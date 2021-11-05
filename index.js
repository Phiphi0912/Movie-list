const baseUrl = 'https://movie-list.alphacamp.io'
const indexUrl = baseUrl + '/api/v1/movies/'
const posterUrl = baseUrl + '/posters/'
const movie_per_page = 12
const paginator = document.querySelector('#paginator')

const movies = []
let filteredMovies = [] // 搜尋電影的陣列
let page = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const container = document.querySelector('.container')

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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })

  dataPanel.innerHTML = rawHtml
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / movie_per_page) // math.ceil 無條件進位
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

function getMoviePage(page) {
  // page 1 -> movie 0 - 11
  // page 2 -> movie 12 - 23
  // 這裡的movie可以指 完整的 movies [80], 或者 filteredMovies 搜尋的movie

  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page - 1) * movie_per_page

  return data.slice(startIndex, startIndex + movie_per_page)
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

function addFavorite(id) {
  // console.log(id)
  function isMovieMatched(movie) {
    return movie.id === id
  }

  const list = JSON.parse(localStorage.getItem('favoriteMovie')) || [] // 第一次使用收藏功能時，會取回 null 值，因此，list 會得到一個空陣列。而之後 local storage 有東西時，就會拿到 localStorage.getItem('favoriteMovies') 取回來的資料了！

  const movie = movies.find(isMovieMatched) //find 會回傳第一個滿足條件要求的物件 // 這邊利用 find 去電影總表中查看，找出 id 相同的電影物件回傳，暫存在 movie

  if (list.some((movie) => movie.id === id)) { // some 是判斷陣列中是否已有某資料，若有回傳true
    return alert('此電影已在收藏清單中!')
  }

  list.push(movie) // 把 movie 推進收藏清單
  // const jsonString = JSON.stringify(list) //stringify 是轉為json字串
  // console.log('json string:', jsonString)
  // console.log('json object', JSON.parse(jsonString)) // parse 是將json字串轉回 JS物件
  localStorage.setItem('favoriteMovie', JSON.stringify(list)) // 接著呼叫 localStorage.setItem，把更新後的收藏清單同步到 local storage
  console.log(list)
}

dataPanel.addEventListener('click', function dataPanel(event) {
  const target = event.target
  if (target.matches('.btn-show-movie')) {
    // console.log(target.dataset) //dataset 回傳的都會是字串，所以要將ID轉為數字
    showMovie(Number(target.dataset.id))
  } else if (target.matches('.btn-add-favorite')) {
    addFavorite(Number(target.dataset.id))
  }
})

paginator.addEventListener('click', function pageClick(event) {
  if (event.target.tagName !== "A") return

  page = Number(event.target.dataset.page)

  if (event.target.matches('.list')) {
    renderList(getMoviePage(page))
  } else {
    renderMovieList(getMoviePage(page))
  }
})

searchForm.addEventListener('submit', function searchSubmit(event) {
  event.preventDefault();
  // trim() 能夠將值的前後空白給消除
  // toLowerCase() 能夠將值都轉為小寫
  const keyWord = searchInput.value.trim().toLowerCase()
  // let filteredMovies = [] // 存放搜尋完的結果

  // if (!keyWord.length) {  // keyWord.length的布林值為false
  //   return alert ('Please enter a correct string!')
  // }


  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyWord)
  )

  if (filteredMovies.length === 0) {
    return alert('Please enter a correct keyword：' + keyWord)
  }

  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyWord)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  renderPaginator(filteredMovies.length)

  if (event.target.matches('.list')) {
    renderList(getMoviePage(1))
  } else {
    renderMovieList(getMoviePage(1))
  }
  // renderMovieList(getMoviePage(1))
})

axios.get(indexUrl).then((response) => {
  // response.data.results 為 Array(80)
  // 最直覺的方式可以利用迴圈將 response.data.results中的陣列資料一個一個取出後，在放進 movies中
  // for (let movie of response.data.results) {
  //   movies.push(movie)
  // }
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviePage(1))
})

// localStorage.setItem('default_language', 'English')
// console.log(localStorage.getItem('default_language'))
// localStorage.removeItem('default_language')

// 利用監聽器判斷點擊的按鈕是哪個，將再次render分頁器
container.addEventListener('click', (event) => {
  changeList(event)
})

function changeList(event) {
  if (event.target.matches('.fa-th')) {
    renderMovieList(getMoviePage(filteredMovies.length ? 1 : page))  // 這邊是預防在第二頁進行搜尋時，page會變成2，此時在轉換list頁面時會產生錯誤
    renderPaginator(filteredMovies.length ? filteredMovies.length : movies.length)
  } else if (event.target.matches('.fa-bars')) {
    renderList(getMoviePage(filteredMovies.length ? 1 : page))  // 條件設定為filteredMovies.length > 0時，代表正在進行搜尋動作
    renderListPaginator(filteredMovies.length ? filteredMovies.length : movies.length)
  }
}

function renderList(data) {
  let rawHtml = ''

  data.forEach((item) => {
    // 需要title, image
    rawHtml += `<table>
        <tr>
          <th>${item.title}</th>
          <td class="p-2 d-flex justify-content-end">
            <div>
              <button class="btn btn-primary btn-show-movie mr-2" data-toggle="modal" data-target="#movieModal"
                data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </td>
        </tr>
      </table>
    `
  })

  dataPanel.innerHTML = rawHtml
}

// 轉換到 list模式後，將重新 render paginator
function renderListPaginator(amount) {
  const numberOfPages = Math.ceil(amount / movie_per_page) // math.ceil 無條件進位
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link list" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}
