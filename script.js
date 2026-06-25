const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (siteNav && navToggle) {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

const observeReveals = (scope = document) => {
  scope.querySelectorAll(".reveal").forEach((element) => {
    if (!element.classList.contains("visible")) {
      revealObserver.observe(element);
    }
  });
};

observeReveals();

const savedArticlesKey = "portfolioBlogArticles";
const defaultArticles = [
  {
    id: "default-uart",
    category: "Firmware",
    title: "Designing UART logs that help during board bring-up",
    body: "Short notes on making debug logs useful without flooding the serial console."
  },
  {
    id: "default-rtos",
    category: "RTOS",
    title: "When to use queues, semaphores, and event groups in FreeRTOS",
    body: "A practical comparison for choosing the right synchronization primitive."
  },
  {
    id: "default-hardware",
    category: "Hardware",
    title: "Practical checklist for SPI and I2C sensor debugging",
    body: "Bring-up checks for wiring, bus speed, pullups, and datasheet details."
  }
];

const getArticles = () => {
  const savedArticles = localStorage.getItem(savedArticlesKey);

  if (!savedArticles) {
    return defaultArticles;
  }

  try {
    const parsedArticles = JSON.parse(savedArticles);
    return Array.isArray(parsedArticles) ? parsedArticles : defaultArticles;
  } catch {
    return defaultArticles;
  }
};

const saveArticles = (articles) => {
  localStorage.setItem(savedArticlesKey, JSON.stringify(articles));
};

const createArticleCard = (article) => {
  const card = document.createElement("article");
  card.className = "blog-card reveal";
  card.innerHTML = `
    <p></p>
    <h3></h3>
    <span></span>
  `;
  card.querySelector("p").textContent = article.category;
  card.querySelector("h3").textContent = article.title;
  card.querySelector("span").textContent = article.body;
  return card;
};

const blogList = document.querySelector("#blog-list");

if (blogList) {
  blogList.innerHTML = "";
  getArticles().forEach((article) => {
    blogList.append(createArticleCard(article));
  });
  observeReveals(blogList);
}

const articleForm = document.querySelector("#blog-form");
const articleList = document.querySelector("#article-list");
const emptyState = document.querySelector("#empty-state");
const articleId = document.querySelector("#article-id");
const articleCategory = document.querySelector("#article-category");
const articleTitle = document.querySelector("#article-title");
const articleBody = document.querySelector("#article-body");
const clearFormButton = document.querySelector("#clear-form");
const saveArticleButton = document.querySelector("#save-article");

const resetArticleForm = () => {
  articleForm.reset();
  articleId.value = "";
  saveArticleButton.textContent = "Save Article";
};

const renderEditorArticles = () => {
  if (!articleList) {
    return;
  }

  const articles = getArticles();
  articleList.innerHTML = "";
  emptyState.hidden = articles.length > 0;

  articles.forEach((article) => {
    const item = document.createElement("article");
    item.className = "article-item";
    item.innerHTML = `
      <p class="project-tag"></p>
      <h3></h3>
      <p class="article-preview"></p>
      <div class="article-actions">
        <button type="button" data-action="edit">Edit</button>
        <button class="danger" type="button" data-action="delete">Delete</button>
      </div>
    `;
    item.querySelector(".project-tag").textContent = article.category;
    item.querySelector("h3").textContent = article.title;
    item.querySelector(".article-preview").textContent = article.body;
    item.querySelector("[data-action='edit']").addEventListener("click", () => {
      articleId.value = article.id;
      articleCategory.value = article.category;
      articleTitle.value = article.title;
      articleBody.value = article.body;
      saveArticleButton.textContent = "Update Article";
      articleTitle.focus();
    });
    item.querySelector("[data-action='delete']").addEventListener("click", () => {
      const updatedArticles = getArticles().filter((entry) => entry.id !== article.id);
      saveArticles(updatedArticles);

      if (articleId.value === article.id) {
        resetArticleForm();
      }

      renderEditorArticles();
    });
    articleList.append(item);
  });
};

if (articleForm) {
  renderEditorArticles();

  articleForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const articles = getArticles();
    const currentId = articleId.value || `article-${Date.now()}`;
    const savedArticle = {
      id: currentId,
      category: articleCategory.value.trim(),
      title: articleTitle.value.trim(),
      body: articleBody.value.trim()
    };
    const existingIndex = articles.findIndex((article) => article.id === currentId);

    if (existingIndex >= 0) {
      articles[existingIndex] = savedArticle;
    } else {
      articles.unshift(savedArticle);
    }

    saveArticles(articles);
    resetArticleForm();
    renderEditorArticles();
  });

  clearFormButton.addEventListener("click", resetArticleForm);
}

const sections = document.querySelectorAll("main section[id]");

if (sections.length > 0) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );

  sections.forEach((section) => activeObserver.observe(section));
}
