import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronRight,
  Image as ImageIcon,
  LoaderCircle,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  RotateCcw,
  Send,
  ShieldCheck,
  WifiOff,
  X,
} from 'lucide-react';

import {
  getConversation,
  getConversationMessages,
  sendConversationMessage,
} from '../api/conversations.api';

import {
  acceptOffer,
  counterOffer,
  createOffer,
  rejectOffer,
} from '../api/offers.api';

import { useAuth } from '../context/AuthContext';
import { socket } from '../sockets/socket';

const toMessages = (data) =>
  Array.isArray(data) ? data : data?.items || [];

const dayLabel = (date) => {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return 'Today';
  }

  if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return messageDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const timeLabel = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

const initials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return 'U';

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

const MessageStatus = ({ status }) => {
  if (status === 'sending') {
    return <LoaderCircle className="h-3.5 w-3.5 animate-spin" />;
  }

  if (status === 'failed') {
    return <span className="font-semibold text-red-500">Failed</span>;
  }

  if (status === 'read' || status === 'delivered') {
    return (
      <CheckCheck className="h-3.5 w-3.5 text-brand-500" />
    );
  }

  return <Check className="h-3.5 w-3.5" />;
};

const OfferCard = ({ offer, isSeller, onAction }) => {
  const status = offer.status;

  const statusConfig = {
    PENDING: {
      label: 'Pending',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    COUNTERED: {
      label: 'Counter offer',
      className: 'bg-brand-50 text-brand-700 border-brand-200',
    },
    ACCEPTED: {
      label: 'Accepted',
      className: 'bg-campus-50 text-campus-700 border-campus-200',
    },
    REJECTED: {
      label: 'Rejected',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
  };

  const config =
    statusConfig[status] || statusConfig.PENDING;

  const canAct =
    status === 'PENDING' || status === 'COUNTERED';

  return (
    <div className="my-4 max-w-sm overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-sm">
      <div className="border-b border-brand-100 bg-brand-50/70 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
            Price offer
          </span>

          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${config.className}`}
          >
            {config.label}
          </span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-3xl font-extrabold tracking-tight text-slate-900">
          ₹{Number(offer.amount).toLocaleString('en-IN')}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Marketplace offer
        </p>

        {canAct && (
          <div className="mt-4 flex flex-wrap gap-2">
            {(!isSeller && status === 'COUNTERED') || isSeller ? (
              <button
                type="button"
                onClick={() => onAction('accept')}
                className="rounded-xl bg-campus-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-campus-800"
              >
                Accept
              </button>
            ) : null}

            {isSeller && (
              <button
                type="button"
                onClick={() => onAction('counter')}
                className="rounded-xl border border-brand-200 bg-white px-4 py-2 text-xs font-bold text-brand-700 transition hover:bg-brand-50"
              >
                Counter
              </button>
            )}

            <button
              type="button"
              onClick={() => onAction('reject')}
              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50"
            >
              Reject
            </button>
          </div>
        )}

        {status === 'ACCEPTED' && (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-campus-700">
            <CheckCheck className="h-4 w-4" />
            Offer accepted
          </div>
        )}

        {status === 'REJECTED' && (
          <div className="mt-3 text-xs font-semibold text-red-600">
            Offer declined
          </div>
        )}
      </div>
    </div>
  );
};

const MessageRow = ({ message, isOwn, onRetry }) => {
  if (message.type === 'SYSTEM') {
    return (
      <div className="my-5 flex items-center gap-3 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span>{message.text}</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    );
  }

  return (
    <div
      className={`flex ${
        isOwn ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`group flex max-w-[84%] flex-col sm:max-w-[68%] ${
          isOwn ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={[
            'relative px-4 py-3 text-sm leading-6 shadow-sm',
            isOwn
              ? 'rounded-2xl rounded-tr-md bg-slate-900 text-white'
              : 'rounded-2xl rounded-tl-md border border-slate-200 bg-white text-slate-800',
          ].join(' ')}
        >
          <p className="whitespace-pre-wrap break-words">
            {message.text}
          </p>
        </div>

        <div
          className={`mt-1.5 flex items-center gap-1.5 px-1 text-[10px] ${
            isOwn
              ? 'text-slate-400'
              : 'text-slate-400'
          }`}
        >
          <span>{timeLabel(message.createdAt)}</span>

          {isOwn && (
            <MessageStatus
              status={message.status || 'sent'}
            />
          )}

          {message.status === 'failed' && (
            <button
              type="button"
              onClick={onRetry}
              className="ml-1 inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ListingPreview = ({ listing }) => {
  if (!listing) return null;

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 transition hover:border-slate-300 hover:bg-white"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-200">
        {listing.images?.[0] ? (
          <img
            src={listing.images[0]}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-5 w-5 text-slate-400" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-800">
          {listing.title}
        </p>

        <p className="mt-0.5 text-sm font-extrabold text-brand-700">
          ₹{listing.price?.toLocaleString('en-IN')}
        </p>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5" />
    </Link>
  );
};

export const Chat = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const messagesRef = useRef(null);

  const [draft, setDraft] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [connection, setConnection] = useState('connecting');
  const [roomError, setRoomError] = useState('');
  const [showNewMessages, setShowNewMessages] = useState(false);
  const [optimisticMessage, setOptimisticMessage] =
    useState(null);
  const [latestOffer, setLatestOffer] = useState(null);
  const [showOfferBox, setShowOfferBox] = useState(false);

  const conversationQuery = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => getConversation(conversationId),
  });

  const messagesQuery = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () =>
      getConversationMessages(conversationId, {
        limit: 30,
      }),
    select: toMessages,
    refetchInterval:
      connection === 'offline' ? 3000 : false,
  });

  const conversation = conversationQuery.data;
  const messages = messagesQuery.data || [];

  const isSeller =
    conversation?.sellerId?._id === user?._id;

  const otherPerson = isSeller
    ? conversation?.buyerId
    : conversation?.sellerId;

  const canOffer =
    !isSeller &&
    conversation?.listingId?.status !== 'SOLD';

  const sendMutation = useMutation({
    mutationFn: sendConversationMessage,

    onMutate: ({ text }) => {
      setOptimisticMessage({
        _id: `pending-${Date.now()}`,
        text,
        createdAt: new Date().toISOString(),
        status: 'sending',
      });
    },

    onSuccess: () => {
      setDraft('');
      setOptimisticMessage(null);

      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      });
    },

    onError: () => {
      setOptimisticMessage((current) =>
        current
          ? {
              ...current,
              status: 'failed',
            }
          : current
      );
    },
  });

  const offerMutation = useMutation({
    mutationFn: createOffer,

    onSuccess: (offer) => {
      setLatestOffer(offer);
      setOfferAmount('');
      setShowOfferBox(false);

      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      });
    },
  });

  const offerActionMutation = useMutation({
    mutationFn: ({ action, id, amount }) =>
      action === 'counter'
        ? counterOffer({ id, amount })
        : action === 'accept'
        ? acceptOffer(id)
        : rejectOffer(id),

    onSuccess: (offer) => {
      setLatestOffer(offer);

      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      });
    },
  });

  useEffect(() => {
    const joinConversation = () => {
      socket.emit(
        'joinConversation',
        conversationId,
        (result) => {
          if (!result?.success) {
            setConnection('offline');
            setRoomError(
              result?.message ||
                'Could not join this conversation.'
            );
          } else {
            setRoomError('');
          }
        }
      );
    };

    const onConnect = () => {
      setConnection('online');
      setRoomError('');
      joinConversation();
    };

    const onDisconnect = () => {
      setConnection('offline');
    };

    const onConnectError = (error) => {
      setConnection('offline');
      setRoomError(
        error.message || 'Socket authentication failed.'
      );
    };

    const onMessage = (message) => {
      queryClient.setQueryData(
        ['messages', conversationId],
        (current = []) => {
          const existing = toMessages(current);

          if (
            existing.some(
              (item) => item._id === message._id
            )
          ) {
            return existing;
          }

          if (
            messagesRef.current &&
            messagesRef.current.scrollHeight -
              messagesRef.current.scrollTop -
              messagesRef.current.clientHeight >
              160
          ) {
            setShowNewMessages(true);
          }

          return [...existing, message];
        }
      );
    };

    const onOffer = (offer) => {
      setLatestOffer(offer);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('newMessage', onMessage);
    socket.on('offer:new', onOffer);
    socket.on('offer:updated', onOffer);

    if (socket.connected) {
      onConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.emit(
        'leaveConversation',
        conversationId
      );

      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(
        'connect_error',
        onConnectError
      );
      socket.off('newMessage', onMessage);
      socket.off('offer:new', onOffer);
      socket.off('offer:updated', onOffer);
    };
  }, [conversationId, queryClient]);

  useEffect(() => {
    if (!messagesRef.current) return;

    messagesRef.current.scrollTop =
      messagesRef.current.scrollHeight;
  }, [conversationId]);

  const scrollToLatest = () => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: 'smooth',
    });

    setShowNewMessages(false);
  };

  const submit = (event) => {
    event.preventDefault();

    if (
      draft.trim() &&
      !sendMutation.isPending
    ) {
      sendMutation.mutate({
        id: conversationId,
        text: draft.trim(),
      });
    }
  };

  const retry = () => {
    if (!optimisticMessage?.text) return;

    sendMutation.mutate({
      id: conversationId,
      text: optimisticMessage.text,
    });
  };

  const renderedMessages = useMemo(() => {
    const rows = [];
    let previousDay = '';

    messages.forEach((message) => {
      const currentDay = dayLabel(
        message.createdAt
      );

      if (currentDay !== previousDay) {
        rows.push(
          <div
            key={`date-${currentDay}`}
            className="my-6 flex items-center gap-3"
          >
            <span className="h-px flex-1 bg-slate-200" />

            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {currentDay}
            </span>

            <span className="h-px flex-1 bg-slate-200" />
          </div>
        );

        previousDay = currentDay;
      }

      rows.push(
        <MessageRow
          key={message._id}
          message={message}
          isOwn={
            message.senderId?._id === user?._id ||
            message.senderId === user?._id
          }
        />
      );
    });

    if (optimisticMessage) {
      rows.push(
        <MessageRow
          key={optimisticMessage._id}
          message={optimisticMessage}
          isOwn
          onRetry={retry}
        />
      );
    }

    return rows;
  }, [
    messages,
    optimisticMessage,
    user?._id,
  ]);

  if (conversationQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-sm text-slate-500">
        Loading conversation...
      </div>
    );
  }

  if (conversationQuery.isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-sm text-red-700">
        Could not load this conversation.
      </div>
    );
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-100px)] max-w-7xl flex-col px-2 py-3 sm:px-4 sm:py-5 lg:px-6">
      <Link
        to="/messages"
        className="mb-3 inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Messages
      </Link>

      <div className="grid min-h-[calc(100vh-155px)] flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.06)] lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* CHAT */}
        <div className="flex min-h-0 flex-col">
          {/* HEADER */}
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-campus-100 text-sm font-extrabold text-slate-700 ring-4 ring-slate-50">
                {initials(otherPerson?.name)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-900 sm:text-base">
                    {otherPerson?.name ||
                      'Marketplace participant'}
                  </p>

                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-campus-600" />
                </div>

                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                  {connection === 'online' ? (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-campus-500 shadow-[0_0_0_3px_rgba(34,197,94,0.12)]" />
                      <span>Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3" />
                      <span>Reconnecting...</span>
                    </>
                  )}
                </div>
              </div>

              <div className="hidden w-64 sm:block">
                <ListingPreview
                  listing={conversation.listingId}
                />
              </div>

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:hidden"
                aria-label="More options"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            {roomError && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                <span>{roomError}</span>

                <button
                  type="button"
                  onClick={() => setRoomError('')}
                  className="shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* MOBILE LISTING */}
            <div className="mt-3 sm:hidden">
              <ListingPreview
                listing={conversation.listingId}
              />
            </div>
          </header>

          {/* MESSAGES */}
          <div
            ref={messagesRef}
            onScroll={() => {
              if (!messagesRef.current) return;

              const distance =
                messagesRef.current.scrollHeight -
                messagesRef.current.scrollTop -
                messagesRef.current.clientHeight;

              if (distance < 80) {
                setShowNewMessages(false);
              }
            }}
            className="relative min-h-0 flex-1 overflow-y-auto bg-slate-50/70 px-3 py-4 sm:px-6 sm:py-6"
          >
            {messages.length === 0 &&
            !messagesQuery.isLoading ? (
              <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm ring-1 ring-slate-200">
                  <MessageCircle className="h-6 w-6" />
                </div>

                <p className="mt-4 font-bold text-slate-900">
                  Start the conversation
                </p>

                <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
                  Ask about availability, condition,
                  price, or pickup location.
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {[
                    'Is this available?',
                    'Can you negotiate?',
                    'Where can we meet?',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        setDraft(suggestion)
                      }
                      className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto flex max-w-3xl flex-col gap-2">
                {renderedMessages}
              </div>
            )}

            {showNewMessages && (
              <button
                type="button"
                onClick={scrollToLatest}
                className="sticky bottom-3 left-1/2 mx-auto flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-lg transition hover:border-brand-200 hover:text-brand-700"
              >
                <ArrowDown className="h-3.5 w-3.5" />
                New messages
              </button>
            )}
          </div>

          {/* COMPOSER */}
          <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
            <div className="mx-auto max-w-3xl">
              {/* OFFER */}
              {canOffer && (
                <>
                  {!showOfferBox ? (
                    <button
                      type="button"
                      onClick={() =>
                        setShowOfferBox(true)
                      }
                      className="mb-3 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
                    >
                      + Make an offer
                    </button>
                  ) : (
                    <div className="mb-3 rounded-2xl border border-brand-200 bg-brand-50/70 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-bold text-brand-800">
                          Make an offer
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            setShowOfferBox(false);
                            setOfferAmount('');
                          }}
                          className="text-brand-500 hover:text-brand-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex flex-1 items-center rounded-xl border border-brand-200 bg-white px-3">
                          <span className="text-sm font-semibold text-slate-400">
                            ₹
                          </span>

                          <input
                            type="number"
                            min="1"
                            value={offerAmount}
                            onChange={(event) =>
                              setOfferAmount(
                                event.target.value
                              )
                            }
                            placeholder="Enter amount"
                            className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm font-semibold outline-none"
                            autoFocus
                          />
                        </div>

                        <button
                          type="button"
                          disabled={
                            !offerAmount ||
                            offerMutation.isPending
                          }
                          onClick={() =>
                            offerMutation.mutate({
                              conversationId,
                              amount: Number(
                                offerAmount
                              ),
                            })
                          }
                          className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {offerMutation.isPending
                            ? 'Sending...'
                            : 'Send offer'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {latestOffer && (
                <OfferCard
                  offer={latestOffer}
                  isSeller={isSeller}
                  onAction={(action) =>
                    offerActionMutation.mutate({
                      action,
                      id: latestOffer._id,
                    })
                  }
                />
              )}

              {/* MESSAGE INPUT */}
              <form
                onSubmit={submit}
                className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-50"
              >
                <textarea
                  rows="1"
                  value={draft}
                  onChange={(event) =>
                    setDraft(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      submit(event);
                    }
                  }}
                  placeholder="Write a message..."
                  aria-label="Message"
                  className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  disabled={
                    !draft.trim() ||
                    sendMutation.isPending
                  }
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {sendMutation.isPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>

              <p className="mt-2 hidden px-2 text-[10px] text-slate-400 sm:block">
                Enter to send · Shift + Enter for a new line
              </p>
            </div>
          </div>
        </div>

        {/* LISTING SIDEBAR */}
        <aside className="hidden border-l border-slate-200 bg-white p-5 lg:block">
          <div className="sticky top-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                About this listing
              </p>

              <ShieldCheck className="h-4 w-4 text-campus-600" />
            </div>

            <Link
              to={`/listings/${conversation.listingId?._id}`}
              className="group mt-4 block"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                {conversation.listingId?.images?.[0] ? (
                  <img
                    src={
                      conversation.listingId.images[0]
                    }
                    alt={
                      conversation.listingId.title
                    }
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <p className="font-bold text-slate-900">
                  {conversation.listingId?.title}
                </p>

                <p className="mt-1 text-2xl font-extrabold tracking-tight text-brand-700">
                  ₹
                  {conversation.listingId?.price?.toLocaleString(
                    'en-IN'
                  )}
                </p>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>
                    {conversation.listingId?.location}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      conversation.listingId?.status ===
                      'SOLD'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-campus-50 text-campus-700'
                    }`}
                  >
                    {conversation.listingId?.status ===
                    'SOLD'
                      ? 'Sold'
                      : 'Available'}
                  </span>

                  <span className="flex items-center gap-1 text-xs font-semibold text-brand-600 transition group-hover:gap-1.5">
                    View listing
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-campus-600" />

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Campus marketplace
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Keep conversations and
                    negotiations inside CampusLoop
                    for a safer campus transaction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

