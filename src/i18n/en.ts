/**
 * English is the source of truth for the translation shape. `Translation` is
 * derived from it, so a missing or misspelled Persian key is a type error.
 */
export const en = {
  common: {
    appName: 'Lumière',
    appNameFull: 'Lumière Cinema',
    tagline: 'Cinema, properly.',
    loading: 'Loading',
    retry: 'Try again',
    close: 'Close',
    cancel: 'Cancel',
    back: 'Back',
    viewAll: 'View all',
    scrollBack: 'Scroll back',
    scrollForward: 'Scroll forward',
    outOfTen: '/10',
    durationValue: '{{hours}}h {{minutes}}m',
    durationMinutesOnly: '{{minutes}}m',
    durationHoursOnly: '{{hours}}h',
  },

  nav: {
    home: 'Home',
    movies: 'Movies',
    reservations: 'My reservations',
    about: 'About',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    skipToContent: 'Skip to content',
    toggleTheme: 'Switch theme',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    language: 'Language',
    languageEnglish: 'English',
    languagePersian: 'فارسی',
    bookNow: 'Book now',
  },

  home: {
    heroEyebrow: 'Featured presentation',
    heroBook: 'Book tickets',
    heroDetails: 'More details',
    heroScroll: 'Browse the programme',
    nowShowingTitle: 'Now showing',
    nowShowingSubtitle: 'Playing across all three of our venues this week.',
    popularTitle: 'Popular this week',
    popularSubtitle: 'What our audiences are rating highest right now.',
    comingSoonTitle: 'Coming soon',
    comingSoonSubtitle: 'On sale shortly — add them to your watchlist.',
    cinemasTitle: 'Three cinemas, one ticket',
    cinemasSubtitle:
      'Laser projection, Dolby Atmos sound and reclining seats as standard at every Lumière venue.',
    featuresTitle: 'Built for the way you actually book',
    featuresSubtitle: 'No queues, no accounts, no small print.',
    features: {
      seats: {
        title: 'Pick your exact seat',
        body: 'A true-to-life auditorium map with aisles, premium rows and VIP recliners — so you know precisely where you will be sitting.',
      },
      instant: {
        title: 'Booked in seconds',
        body: 'Choose a showtime, tap your seats, confirm. Your reference number appears immediately.',
      },
      formats: {
        title: 'IMAX, 3D and 2D',
        body: 'Every screening lists its format and soundtrack up front, including subtitled and dubbed presentations.',
      },
      flexible: {
        title: 'Cancel any time',
        body: 'Plans change. Cancel from your reservations page and the seats are released straight away.',
      },
    },
    ctaTitle: 'The programme is live',
    ctaBody: '{{movies, number}} films, three cinemas and six days of showtimes waiting for you.',
    ctaButton: 'See what is on',
  },

  movies: {
    title: 'Movies',
    subtitle: 'Everything playing and everything on the way.',
    searchLabel: 'Search films',
    searchPlaceholder: 'Search by title or director…',
    genreLabel: 'Genre',
    allGenres: 'All genres',
    statusLabel: 'Status',
    allStatuses: 'Everything',
    clearFilters: 'Clear filters',
    resultsCount_one: '{{count, number}} film',
    resultsCount_other: '{{count, number}} films',
    emptyTitle: 'Nothing matches that search',
    emptyBody: 'Try a different title, or clear your filters to see the full programme.',
  },

  movie: {
    synopsisTitle: 'Synopsis',
    detailsTitle: 'Details',
    director: 'Director',
    cast: 'Cast',
    duration: 'Running time',
    rating: 'Rating',
    released: 'Released',
    releases: 'Releases',
    genre: 'Genre',
    ageRating: 'Certificate',
    showtimesTitle: 'Showtimes',
    showtimesSubtitle: 'Choose a day, then pick a screening.',
    selectDate: 'Select a date',
    noShowtimesTodayTitle: 'No screenings on this day',
    noShowtimesTodayBody: 'Pick another date to see the rest of the programme.',
    noShowtimesTitle: 'Not yet on sale',
    noShowtimesBody: 'This film has no scheduled screenings. Check back closer to release.',
    comingSoonNote: 'Tickets go on sale nearer the release date.',
    notFoundTitle: 'We could not find that film',
    notFoundBody: 'It may have finished its run, or the link may be wrong.',
    backToMovies: 'Back to all movies',
    bookThisShowing: 'Book this screening',
    pastShowtime: 'Already started',
    soldOut: 'Sold out',
    seatsLeft_one: '{{count, number}} seat left',
    seatsLeft_other: '{{count, number}} seats left',
    from: 'from {{price}}',
  },

  genres: {
    action: 'Action',
    adventure: 'Adventure',
    animation: 'Animation',
    comedy: 'Comedy',
    crime: 'Crime',
    drama: 'Drama',
    horror: 'Horror',
    musical: 'Musical',
    sciFi: 'Sci-Fi',
    thriller: 'Thriller',
  },

  status: {
    nowShowing: 'Now showing',
    comingSoon: 'Coming soon',
  },

  audio: {
    original: 'Original audio',
    subtitled: 'Subtitled',
    dubbed: 'Dubbed',
  },

  dates: {
    today: 'Today',
    tomorrow: 'Tomorrow',
  },

  booking: {
    title: 'Choose your seats',
    stepSeats: 'Seats',
    stepReview: 'Review',
    stepConfirm: 'Confirm',
    screen: 'Screen',
    seatMapLabel: 'Auditorium seat map',
    selectSeatsHint: 'Tap a seat to select it. Tap again to release it.',
    legendTitle: 'Legend',
    legend: {
      available: 'Available',
      selected: 'Selected',
      occupied: 'Taken',
      yours: 'Already yours',
      premium: 'Premium',
      vip: 'VIP recliner',
    },
    tiers: {
      standard: 'Standard',
      premium: 'Premium',
      vip: 'VIP',
    },
    summaryTitle: 'Your booking',
    movieLabel: 'Film',
    cinemaLabel: 'Cinema',
    hallLabel: 'Auditorium',
    dateLabel: 'Date',
    timeLabel: 'Time',
    seatsLabel: 'Seats',
    ticketsLabel: 'Tickets',
    pricePerSeatLabel: 'Price per seat',
    totalLabel: 'Total',
    noSeatsSelectedTitle: 'No seats selected yet',
    noSeatsSelectedBody: 'Pick one or more seats from the map to continue.',
    confirmButton: 'Confirm reservation',
    confirming: 'Confirming…',
    openSummary: 'Review and confirm',
    closeSummary: 'Back to the seat map',
    ticketCount_one: '{{count, number}} ticket',
    ticketCount_other: '{{count, number}} tickets',
    seatCount_one: '{{count, number}} seat',
    seatCount_other: '{{count, number}} seats',
    maxSeatsReached: 'You can book up to {{count, number}} seats in one reservation.',
    seatSelected: 'Seat {{seat}} selected',
    seatDeselected: 'Seat {{seat}} released',
    seatTakenToast: 'No longer available: {{seats}}',
    conflictTitle: 'Those seats have just gone',
    conflictBody:
      'Someone booked {{seats}} while you were choosing, so nothing has been reserved. The map has been refreshed — please pick again.',
    conflictConfirm: 'Pick different seats',
    syncedToast: 'Seat availability updated',
    soldOutTitle: 'This screening is full',
    soldOutBody: 'Every seat has been taken. Try another showtime for this film.',
    notFoundTitle: 'We could not find that screening',
    notFoundBody: 'It may have finished, or the link may be out of date.',
    pastTitle: 'This screening has already started',
    pastBody: 'Online booking closes once the film begins. Please choose a later showtime.',
    backToMovie: 'Back to the film',
    seeOtherShowtimes: 'See other showtimes',
    storageWarning:
      'Your browser is blocking local storage, so reservations will be lost when you close this tab.',
    seatA11y: 'Row {{row}}, seat {{number}}, {{tier}}, {{state}}',
    seatStateAvailable: 'available',
    seatStateSelected: 'selected',
    seatStateOccupied: 'unavailable',
    rowLabel: 'Row {{row}}',
    selectedSeatsA11y_one: '1 seat selected: {{seats}}',
    selectedSeatsA11y_other: '{{count, number}} seats selected: {{seats}}',
  },

  confirmation: {
    title: 'You are going to the cinema',
    subtitle: 'Your seats are reserved. Show this reference at the door.',
    reference: 'Reference',
    movie: 'Film',
    cinema: 'Cinema',
    hall: 'Auditorium',
    date: 'Date',
    time: 'Time',
    seats: 'Seats',
    tickets: 'Tickets',
    total: 'Total paid',
    arriveEarly: 'Doors open 20 minutes before the screening. Trailers run for about 10 minutes.',
    downloadPdf: 'Download PDF',
    downloadPdfHint:
      'Opens your browser’s print dialog — choose “Save as PDF” as the destination to save the ticket.',
    viewReservations: 'View my reservations',
    backHome: 'Back to home',
    notFoundTitle: 'We could not find that reservation',
    notFoundBody: 'It may have been cancelled, or saved in a different browser.',
    goToReservations: 'Go to my reservations',
  },

  reservations: {
    title: 'My reservations',
    subtitle: 'Everything you have booked in this browser.',
    count_one: '{{count, number}} reservation',
    count_other: '{{count, number}} reservations',
    upcomingTitle: 'Upcoming',
    pastTitle: 'Past and cancelled',
    emptyTitle: 'No reservations yet',
    emptyBody: 'Once you book a screening it will appear here, ready to show at the door.',
    emptyCta: 'Browse the programme',
    reference: 'Reference',
    booked: 'Booked',
    cancelButton: 'Cancel reservation',
    viewTicket: 'View ticket',
    statusConfirmed: 'Confirmed',
    statusCancelled: 'Cancelled',
    statusCompleted: 'Watched',
    cancelConfirmTitle: 'Cancel this reservation?',
    cancelConfirmBody_one:
      'Reservation {{reference}} for {{movie}} will be cancelled and your seat released. This cannot be undone.',
    cancelConfirmBody_other:
      'Reservation {{reference}} for {{movie}} will be cancelled and your {{count, number}} seats released. This cannot be undone.',
    cancelConfirmYes: 'Yes, cancel it',
    cancelConfirmNo: 'Keep my booking',
    cancelledToast: 'Reservation {{reference}} cancelled',
    cancelFailedToast: 'That reservation could not be cancelled',
    clearAll: 'Clear all demo data',
    clearAllConfirmTitle: 'Remove every reservation?',
    clearAllConfirmBody_one:
      'This clears the one reservation stored in this browser so you can start the demo fresh.',
    clearAllConfirmBody_other:
      'This clears all {{count, number}} reservations stored in this browser so you can start the demo fresh.',
    clearAllConfirmYes: 'Clear everything',
    clearedToast: 'All reservations cleared',
  },

  about: {
    title: 'About this project',
    lead: 'Lumière is a front-end portfolio build: a complete cinema booking flow that runs entirely in your browser.',
    storyTitle: 'What it does',
    storyBody:
      'Browse the programme, open a film, pick a day and a screening, choose your seats on a true-to-life auditorium map, review the total and confirm. Your reservations persist across reloads and can be cancelled, which releases the seats again.',
    noBackendTitle: 'There is no server',
    noBackendBody:
      'No API, no database, no account. The catalogue is deterministic seed data and your reservations live in this browser’s local storage. Open the site in two tabs and you will see bookings in one appear in the other.',
    raceTitle: 'Conflicts are handled honestly',
    raceBody:
      'Before a reservation is written, the seats are re-checked against the freshest stored state. If another tab took one of them, the booking is rejected and you are told exactly which seats went. Browser storage cannot give real transactional guarantees, and this does not pretend otherwise.',
    techTitle: 'Built with',
    privacyTitle: 'Your data',
    privacyBody:
      'Nothing leaves your device and nothing is tracked. There are no passwords or personal details anywhere in the app — a reservation is just a reference number, a showtime and a list of seats.',
    backHome: 'Back to home',
  },

  cinemas: {
    address: 'Address',
    screens: 'Auditoriums',
    openingHours: 'Opening hours',
    openingHoursValue: 'Daily, 10:00 – 23:30',
  },

  notFound: {
    code: '404',
    title: 'This reel is missing',
    body: 'The page you were looking for is not here. It may have moved, or the link may be wrong.',
    cta: 'Back to home',
    browse: 'Browse movies',
  },

  footer: {
    tagline: 'Three cinemas. {{movies, number}} films. No queues.',
    exploreTitle: 'Explore',
    visitTitle: 'Visit',
    aboutTitle: 'About',
    rights: '© {{year}} Lumière Cinema. A portfolio project.',
    disclaimer:
      'A demonstration build. No real tickets are sold and no payment is taken. Poster artwork belongs to its respective rights holders.',
    builtWith: 'Built with React, TypeScript and Tailwind CSS.',
  },

  errors: {
    storageTitle: 'Local storage is unavailable',
    storageBody:
      'Your browser is blocking local storage, so reservations will not survive a reload. Everything else works as normal.',
    genericTitle: 'Something went wrong',
    genericBody: 'An unexpected error stopped this page from rendering. Reloading usually fixes it.',
    reload: 'Reload the page',
    imageFailed: 'Artwork unavailable',
  },

  a11y: {
    posterAlt: '{{title}} — poster',
    ratingLabel: 'Rated {{rating}} out of 10',
    cinemaPhotoAlt: '{{cinema}} auditorium',
    loading: 'Loading content',
  },
} as const;

/** Recursively replaces the literal leaves with `string`. */
type Stringify<T> = { [K in keyof T]: T[K] extends string ? string : Stringify<T[K]> };

/**
 * The resource shape with `string` leaves, so Persian can supply its own
 * values while still being checked for completeness.
 */
export type Translation = Stringify<typeof en>;
