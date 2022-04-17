import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post?: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  const totalWords = post.data.content.reduce((acc, group) => {
    const headingWords = group.heading.split(' ').length;

    const bodyWords = group.body.reduce(
      (totalBodyWords, bodyContent) =>
        totalBodyWords + bodyContent.text.split(' ').length,
      0
    );

    const groupWords = headingWords + bodyWords;

    return acc + groupWords;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  return (
    <>
      <Header />
      <main>
        {router.isFallback && <div>Carregando...</div>}
        {!router.isFallback && !post && <div>Erro</div>}
        {post && (
          <>
            <img
              className={styles.banner}
              src={post.data.banner.url}
              alt="banner"
            />
            <article className={`${commonStyles.container} ${styles.post}`}>
              <h1>{post.data.title}</h1>
              <div className={styles.postInfo}>
                <div>
                  <FiCalendar />
                  <span>
                    {format(new Date(post.first_publication_date), 'd MMM Y', {
                      locale: ptBR,
                    })}
                  </span>
                </div>

                <div>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>

                <div>
                  <FiClock />
                  <span>{readTime} min</span>
                </div>
              </div>
              {post.data.content.map(group => (
                <section key={group.heading}>
                  <h2>{group.heading}</h2>

                  <div
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(group.body),
                    }}
                  />
                </section>
              ))}
            </article>
          </>
        )}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    { fetch: [], pageSize: 1 }
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { data, first_publication_date, uid } = await prismic.getByUID(
    'post',
    String(params.slug),
    {
      fetch: [],
    }
  );

  const post = {
    first_publication_date,
    uid,
    data: {
      title: data.title,
      subtitle: data.subtitle,
      author: data.author,
      banner: { url: data.banner.url },
      content: data.content.map(group => ({
        heading: group.heading,
        body: group.body,
      })),
    },
  };

  return {
    props: {
      post,
    },
  };
};
