import { GetStaticProps } from 'next';
import Link from 'next/link';
import { ReactElement, useEffect, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleLoadMore = async (): Promise<void> => {
    try {
      if (!nextPage) {
        return;
      }
      const response = await fetch(nextPage).then(res => res.json());

      setNextPage(response.next_page);
      setPosts(oldState => [
        ...oldState,
        ...response.results.map(post => ({
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
        })),
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <main className={commonStyles.container}>
      <div className={styles.logo}>
        <img src="/images/logo.svg" alt="logo" />
      </div>
      <div className={styles.posts}>
        {posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <div>
                <div>
                  <FiCalendar />
                  <time>
                    {format(new Date(post.first_publication_date), 'd MMM Y', {
                      locale: ptBR,
                    })}
                  </time>
                </div>

                <div>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}
        {nextPage && (
          <button
            className={styles.loadMore}
            onClick={handleLoadMore}
            type="button"
          >
            Carregar mais posts
          </button>
        )}
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 1,
    }
  );

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => ({
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    })),
  };

  return {
    props: {
      postsPagination,
    },
  };
};
